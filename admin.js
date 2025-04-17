// Verificação inicial
console.log("Admin.js iniciado");

try {
  // Configuração do Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyA7_SFUPE6n9KG6LhL9Y6DRanSW5Zn0-2k",
    authDomain: "reliquias-do-xis.firebaseapp.com",
    projectId: "reliquias-do-xis",
    storageBucket: "reliquias-do-xis.appspot.com",
    messagingSenderId: "936551505510",
    appId: "1:936551505510:web:22de1482a8f8d9720257a7"
  };

  // Inicialização segura
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Elementos UI
  const loginSection = document.getElementById("login-section");
  const adminPanel = document.getElementById("admin-panel");
  const loginForm = document.getElementById("login-form");
  const addLocationForm = document.getElementById("add-location-form");

  // Mostra elementos corretamente no carregamento
  function initializeUI() {
    loginSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    
    // Verifica autenticação
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Usuário autenticado:", user.email);
        loginSection.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadAdminContent();
      } else {
        console.log("Nenhum usuário logado");
        loginSection.classList.remove('hidden');
        adminPanel.classList.add('hidden');
      }
    });
  }

  // Carrega o conteúdo do admin
  function loadAdminContent() {
    // Carrega o formulário e as resenhas
    console.log("Carregando conteúdo admin...");
    
    // [Seu código para carregar o autocomplete e as resenhas]
    initAutocomplete();
    loadAllReviews();
  }

  // Inicializa a UI
  initializeUI();

  // [Mantenha todas as outras funções (login, logout, autocomplete, etc.)]

} catch (error) {
  console.error("Erro crítico:", error);
  alert("Erro na aplicação: " + error.message);
}
