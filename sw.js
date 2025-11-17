// Service Worker for Pay4me PWA
// Provides offline functionality and app-like experience

const CACHE_NAME = 'pay4me-v1.0.7';
const urlsToCache = [
  '/',
  '/index.html',
  '/airtime.html',
  '/data.html',
  '/sportybet.html',
  '/login.html',
  '/css/style.css',
  '/js/main.js',
  '/js/auth.js',
  '/js/config.js',
  '/js/api-service.js',
  '/manifest.json',
  // Add icon files when created
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Caching app resources');
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .catch(function(error) {
        console.log('❌ Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('✅ Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external API calls (let them fail gracefully)
  if (event.request.url.includes('vercel.app')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then(function(response) {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(function() {
            // If offline and no cache, show offline page
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for failed payments
self.addEventListener('sync', function(event) {
  if (event.tag === 'payment-retry') {
    console.log('🔄 Retrying failed payments...');
    event.waitUntil(retryFailedPayments());
  }
});

// Push notification support
self.addEventListener('push', function(event) {
  console.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Your recharge is complete!',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close', 
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Pay4me', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Retry failed payments function
async function retryFailedPayments() {
  // Implementation for retrying failed payments when back online
  console.log('🔄 Checking for failed payments to retry...');
  // This would integrate with your payment system
}

// App update notification
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('🚀 Pay4me Service Worker loaded successfully!');