// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyFilmZoneMockKeyForDevelopmentMode",
  authDomain: "filmzone-cinema.firebaseapp.com",
  projectId: "filmzone-cinema",
  storageBucket: "filmzone-cinema.appspot.com",
  messagingSenderId: "109283746501",
  appId: "1:109283746501:web:abcdef1234567890"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);
    const notificationTitle = payload.notification?.title || 'FilmZone Cinema';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new update regarding your tickets or stream.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.warn('[firebase-messaging-sw.js] Service worker setup notification:', error.message);
}
