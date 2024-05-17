self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("calendar-assistant-cache").then(function (cache) {
      return cache.addAll([
        "/",
        "/css/index.css",
        "/css/login.css",
        "/images/voice.png",
        "/js/SpeechRecognition.js"
      ]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
