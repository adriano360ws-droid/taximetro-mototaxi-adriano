const CACHE_NAME = 'taximetro-pro-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-48.png',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-144.png',
  '/icon-192.png',
  '/icon-512.png'
];

// INSTALAR O SERVICE WORKER E ARMAZENAR ARQUIVOS NO CACHE
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// ATIVAR E REMOVER CACHES ANTIGOS
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cache) => {
          return cache !== CACHE_NAME;
        }).map((cache) => {
          return caches.delete(cache);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// INTERCEPTAR REQUISIÇÕES E USAR CACHE PRIMEIRO
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se existir, senão busca da web
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Armazena nova requisição no cache para próxima vez
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
          })
          .catch(() => {
            // Se não tiver conexão e não estiver no cache, retorna página principal
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
