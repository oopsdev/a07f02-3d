// A07F02 3D 模型的 service worker：讓網頁可加入手機主畫面並離線開啟
//   同網域（index.html、A07F02_ikea_models.js、manifest、圖示）：先連網、失敗才用快取（有網路時一定拿到最新版）
//   CDN（jsDelivr 的 three.js 與 Draco 解碼器、Google Fonts）：先用快取、沒有才連網（網址帶版本號，內容不會變）
//   改 index.html 不用動這個檔；改這個檔或要清掉舊快取時把 CACHE 的版本號加一
const CACHE = 'a07f02-v1';
const PRECACHE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon-180.png'];
const CDN_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const MSG_PRECACHE_FAIL = 'service worker 預先快取失敗：';
const MSG_FETCH_FAIL = 'service worker 連網失敗，改用快取：';
const MSG_CACHE_PUT_FAIL = 'service worker 寫入快取失敗：';
const MSG_CLEAN_FAIL = 'service worker 清除舊快取失敗：';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE);
    } catch (err) { console.error(MSG_PRECACHE_FAIL, err); }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    } catch (err) { console.error(MSG_CLEAN_FAIL, err); }
    await self.clients.claim();
  })());
});

async function putCache(req, res) {
  if (!res || !res.ok) return;
  try { const cache = await caches.open(CACHE); await cache.put(req, res.clone()); }
  catch (err) { console.error(MSG_CACHE_PUT_FAIL, err); }
}

// 同網域：network-first。導覽請求離線時退回 index.html
async function networkFirst(req) {
  try {
    const res = await fetch(req);
    await putCache(req, res);
    return res;
  } catch (err) {
    console.error(MSG_FETCH_FAIL, req.url, err);
    const hit = await caches.match(req);
    if (hit) return hit;
    if (req.mode === 'navigate') { const idx = await caches.match('./index.html'); if (idx) return idx; }
    return Response.error();
  }
}

// CDN：cache-first
async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    await putCache(req, res);
    return res;
  } catch (err) {
    console.error(MSG_FETCH_FAIL, req.url, err);
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) event.respondWith(networkFirst(req));
  else if (CDN_HOSTS.includes(url.hostname)) event.respondWith(cacheFirst(req));
});
