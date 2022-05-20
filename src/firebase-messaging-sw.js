// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.

firebase.initializeApp({
    apiKey: 'AIzaSyApbA33CtwYvl41sblhVLSktrGpLw3cH-Q',
    appId: '1:1065261625373:web:8900fa27820245624c16f4',
    authDomain: 'los-peines-de-ro.firebaseapp.com',
    projectId: 'los-peines-de-ro',
    storageBucket: 'los-peines-de-ro.appspot.com',
    messagingSenderId: '1065261625373',
    measurementId: 'G-EP3E7PXHQ2',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

