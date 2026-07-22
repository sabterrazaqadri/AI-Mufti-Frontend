/**
 * Offline shell for AI Mufti.
 *
 * Deliberately conservative: answers, prayer times and library pages must never
 * be served stale, so only the app shell and static assets are cached. A cached
 * fatwa or a yesterday's Asr time would be worse than an offline message.
 */
const CACHE = "ai-mufti-shell-v2";
const OFFLINE_URL = "/offline";

const SHELL = [OFFLINE_URL, "/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: always try the network so content is current; fall back to the
  // offline page only when there is genuinely no connection.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r || Response.error()))
    );
    return;
  }

  // Static build assets are content-hashed, so cache-first is safe for them.
  if (url.pathname.startsWith("/_next/static/") || url.pathname === "/logo.svg") {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
  }
});
