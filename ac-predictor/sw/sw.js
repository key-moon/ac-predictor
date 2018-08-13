importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyC2yuqaalWiwK_HCZKKSivn0pmZN8WJgrU",
    authDomain: "ac-predictor.firebaseapp.com",
    databaseURL: "https://ac-predictor.firebaseio.com",
    projectId: "ac-predictor",
    storageBucket: "ac-predictor.appspot.com",
    messagingSenderId: "454543827983"
});

const messaging = firebase.messaging();
messaging.usePublicVapidKey('BFns3Dm9IES4mwNDS6yNUhPCdIWocaDGgBRQsPD5AsGdeUyyRAqjdrRNMkPPFco71EKCS_Ryob1IyE1d2RJ-d9U');
console.log(messaging.getToken());

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    var notificationTitle = 'ac-predictor default notification';
    var notificationOptions = {
        body: 'Background Message body.'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
    console.log("Installed!");
});