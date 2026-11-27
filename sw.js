// Şantiye Cep – çevrimdışı açılabilsin diye uygulama dosyalarını telefonda saklar.
const C = "santiye-cep-v5";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Microsoft, OneDrive ve Claude istekleri hiçbir zaman önbelleğe alınmaz
  if (!(u.origin === location.origin || u.hostname === "cdnjs.cloudflare.com")) return;
  if (u.search.includes("code=")) return;
  // önce internet, yoksa telefondaki kopya
  e.respondWith(fetch(e.request, { cache: "no-store" }).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
