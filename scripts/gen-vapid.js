#!/usr/bin/env node
import webPush from 'web-push';

function highlight(message) {
  return `\u001B[36m${message}\u001B[0m`;
}

function main() {
  const { publicKey, privateKey } = webPush.generateVAPIDKeys();

  console.info('\nNovas chaves VAPID geradas com sucesso!\n');
  console.info(`${highlight('VITE_VAPID_PUBLIC_KEY')}=${publicKey}`);
  console.info(`${highlight('VAPID_PRIVATE_KEY')}=${privateKey}\n`);
  console.info('Copie os valores acima para o seu arquivo .env/.env.local e mantenha a chave privada fora do frontend.');
  console.info('No Supabase, armazene a chave privada via secrets e forneça a pública para o client.\n');
}

main();
