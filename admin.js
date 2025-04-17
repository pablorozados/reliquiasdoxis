// Configuração do Firebase (use SEUS dados abaixo)
const firebaseConfig = {
  apiKey: "AIzaSyA7_SFUPE6n9KG6LhL9Y6DRanSW5Zn0-2k",
  authDomain: "reliquias-do-xis.firebaseapp.com",
  projectId: "reliquias-do-xis",
  storageBucket: "reliquias-do-xis.appspot.com", // Corrigido para o padrão Firebase
  messagingSenderId: "936551505510",
  appId: "1:936551505510:web:22de1482a8f8d9720257a7"
};

// Inicialização do Firebase (versão compatível)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Verificação de inicialização
console.log("Firebase configurado com:", {
  projectId: app.options.projectId,
  authDomain: app.options.authDomain
});

// [Seu código existente...]
