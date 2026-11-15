/* SJR Today service worker: makes the page installable and lets it open with no signal.
   Network first (so a new version arrives as soon as it is published), falling back to the last copy seen.
   It only handles SJR Today's own files. Every other page in this folder, and all database calls, pass straight through. */
const SHELL = "sjr-today-shell-v1";
const FILES = ["sjr-today-v1-20261112.html", "sjr-today.webmanifest", "sjr-today-icon-192.png", "sjr-today-icon-512.png", "sjr-today-apple-touch-icon.png"];
const mine = url => FILES.some(f => url.pathname.endsWith("/" + f));
self.addEventListener("install", e => e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || !mine(url)) return;
  e.respondWith((async () => {
    const c = await caches.open(SHELL);
    try {
      const r = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 4000))]);
      if (r.ok) c.put(req, r.clone());
      return r;
    } catch (err) {
      return (await c.match(req, { ignoreSearch: true })) || Response.error();
    }
  })());
});
