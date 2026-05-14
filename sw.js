// Dreammaker PG — Service Worker
// 버전 올리면 모든 사용자에게 강제 업데이트됨
const CACHE_VERSION = 'dm-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// 앱셸: 첫 진입 시 캐싱해두고 오프라인에서도 보이게 할 핵심 파일들
const APP_SHELL = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon.png'
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// 활성화 — 옛 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청 처리
//  - HTML 문서: 네트워크 우선 (항상 최신), 실패 시 캐시
//  - 정적 자산(이미지·json·css·js): 캐시 우선
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // POST 등은 통과
  if (req.method !== 'GET') return;

  // Firebase / Firestore 등 외부 API는 캐시하지 않고 그대로 통과
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML 문서
  if (req.destination === 'document') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // 그 외 정적 자산
  event.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
        return res;
      })
    )
  );
});
