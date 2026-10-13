
const CACHE_NAME = "mi-jornada-v1";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    caches.match(evento.request).then((respuestaGuardada) => {
      return respuestaGuardada ||
        fetch(evento.request).catch(() => {
          if (evento.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
