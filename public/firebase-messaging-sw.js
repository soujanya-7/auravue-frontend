importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyArwqibZlnSA7SIfnwMGyqVJO8gzI_V6cU",
  authDomain: "auravue-c8b99.firebaseapp.com",
  projectId: "auravue-c8b99",
  storageBucket: "auravue-c8b99.appspot.com",
  messagingSenderId: "966695370796",
  appId: "1:966695370796:web:3b02c7fb9d23d5e0bc5189"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background message received:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
