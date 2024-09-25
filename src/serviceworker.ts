self.addEventListener("install", event => {
  console.log("Service worker installed");
});

self.addEventListener("activated", event => {
  console.log("Service worker activated");
});

const cacheName = "NotesAppCache_v1";

self.addEventListener("fetch", (event: FetchEvent) => {
  console.log(event);
  // Check if this is a navigation request
  if (event.request.mode === 'navigate') {
    // Open the cache
    event.respondWith(caches.open(cacheName).then((cache) => {
      console.log(event.request.url);
      // Go to the network first
      return fetch(event.request.url).then((fetchedResponse) => {
        cache.put(event.request, fetchedResponse.clone());
        return fetchedResponse;
      }).catch(() => {
        // If the network is unavailable, get
        return cache.match(event.request.url);
      });
    }));

  } else {
    return;
  }
});