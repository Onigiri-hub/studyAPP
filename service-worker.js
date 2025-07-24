
const CACHE_NAME = "stampcard-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/img01.svg",
  "./icons/img02.svg",
  "./sounds/001.mp3",
  "./sounds/002.mp3"
];

// �C���X�g�[�����ɃL���b�V��
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// �I�t���C���Ή��i�L���b�V���D��j
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
