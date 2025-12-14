// config.js - Arquivo para armazenar as chaves de API de forma segura
const config = {
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY || "REDACTED_API_KEY",
        authDomain: "reliquiasdoxis.firebaseapp.com",
        projectId: "reliquiasdoxis",
        storageBucket: "reliquiasdoxis.appspot.com",
        messagingSenderId: "673027539850",
        appId: "1:673027539850:web:c8c5fa9e5dbff158cf92ed"
    },
    googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || "REDACTED_API_KEY"
    }
};

