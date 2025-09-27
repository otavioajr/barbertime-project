export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          service_id: string;
          starts_at: string;
          ends_at: string;
          customer_name: string | null;
          customer_phone: string;
          status: Database['public']['Enums']['appointment_status'];
          public_token: string;
          reminder_sent: boolean;
          created_at: string;
          services?: { name: string } | null;
        };
        Insert: {
          id?: string;
          service_id: string;
          starts_at: string;
          ends_at: string;
          customer_name?: string | null;
          customer_phone: string;
          status?: Database['public']['Enums']['appointment_status'];
          public_token?: string;
          reminder_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          starts_at?: string;
          ends_at?: string;
          customer_name?: string | null;
          customer_phone?: string;
          status?: Database['public']['Enums']['appointment_status'];
          public_token?: string;
          reminder_sent?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'appointments_service_id_fkey';
            columns: ['service_id'];
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          public_token: string | null;
          customer_phone: string | null;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          public_token?: string | null;
          customer_phone?: string | null;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          public_token?: string | null;
          customer_phone?: string | null;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'push_subscriptions_public_token_fkey';
            columns: ['public_token'];
            referencedRelation: 'appointments';
            referencedColumns: ['public_token'];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          name: string;
          duration_min: number;
          price_cents: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          duration_min: number;
          price_cents?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          duration_min?: number;
          price_cents?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      vacations: {
        Row: {
          id: string;
          starts_on: string;
          ends_on: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          starts_on: string;
          ends_on: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          starts_on?: string;
          ends_on?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      work_hours: {
        Row: {
          id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          weekday: number;
          start_time: string;
          end_time: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_public_token: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      next_public_token: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      appointment_status: 'scheduled' | 'confirmed' | 'canceled' | 'completed';
    };
  };
}

export type PublicSchema = Database['public'];
