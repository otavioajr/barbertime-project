import webpush from 'npm:web-push@3.6.7';

import type { Database } from '../../types.ts';
import { getEnv } from './env.ts';
import { getServiceClient } from './supabase-client.ts';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushMessagePayload {
  title: string;
  body: string;
  url?: string;
}

let configured = false;

function ensureConfigured(): boolean {
  if (configured) {
    return true;
  }

  const env = getEnv();
  if (!env.VAPID_PRIVATE_KEY || !env.VAPID_PUBLIC_KEY) {
    console.warn('[push] VAPID keys not configured. Skipping push delivery.');
    return false;
  }

  webpush.setVapidDetails('mailto:notifications@barbertime.app', env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

export async function sendPushNotification(
  subscription: PushSubscriptionPayload,
  payload: PushMessagePayload,
): Promise<boolean> {
  if (!ensureConfigured()) {
    return false;
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('[push] Failed to send notification', error);
    return false;
  }
}

function dedupeSubscriptions(
  subscriptions: Database['public']['Tables']['push_subscriptions']['Row'][],
): Database['public']['Tables']['push_subscriptions']['Row'][] {
  const seen = new Set<string>();
  const result: Database['public']['Tables']['push_subscriptions']['Row'][] = [];
  for (const subscription of subscriptions) {
    const key = `${subscription.endpoint}:${subscription.p256dh}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(subscription);
    }
  }
  return result;
}

export async function broadcastNotification(
  publicToken: string,
  customerPhone: string,
  payload: PushMessagePayload,
): Promise<number> {
  if (!ensureConfigured()) {
    return 0;
  }

  const client = getServiceClient();
  const { data, error } = await client
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .or(`public_token.eq.${publicToken},customer_phone.eq.${customerPhone}`)
    .returns<Database['public']['Tables']['push_subscriptions']['Row'][] | null>();

  if (error) {
    console.error('[push] Failed to load subscriptions', error);
    return 0;
  }

  const unique = dedupeSubscriptions(data ?? []);
  let delivered = 0;

  for (const subscription of unique) {
    const success = await sendPushNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      payload,
    );

    if (success) {
      delivered += 1;
    }
  }

  return delivered;
}
