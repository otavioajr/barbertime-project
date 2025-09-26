/// <reference lib="webworker" />

self.addEventListener('install', () => {
  console.info('Service worker instalado (placeholder).');
});

self.addEventListener('activate', () => {
  console.info('Service worker ativado (placeholder).');
});

self.addEventListener('fetch', () => {
  // Estratégias de cache serão adicionadas posteriormente.
});

export {};
