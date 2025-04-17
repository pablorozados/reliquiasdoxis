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

  // Elementos UI com verificação
  const loginSection = document.getElementById("login-section");
  const adminPanel = document.getElementById("admin-panel");
  const loginForm = document.getElementById("login-form");
  
  if (!loginSection || !adminPanel || !loginForm) {
    throw new Error("Elementos da página não encontrados");
  }

  // Controle de autenticação simplificado
  auth.onAuthStateChanged((user) => {
    try {
      if (user) {
        console.log("Usuário autenticado:", user.email);
        loginSection.classList.add("hidden");
        adminPanel.classList.remove("hidden");
        
        // Carrega conteúdo do admin
        document.getElementById("loading-msg").textContent = "Bem-vindo!";
        console.log("Painel admin carregado");
      } else {
        console.log("Nenhum usuário logado");
        loginSection.classList.remove("hidden");
        adminPanel.classList.add("hidden");
      }
    } catch (error) {
      console.error("Erro no authStateChanged:", error);
    }
  });

  // Sistema de login básico
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Tentativa de login...");
    // Seu código de login existente
  });

} catch (error) {
  console.error("Erro crítico no admin.js:", error);
  document.body.innerHTML = `
    <div style="color: red; padding: 20px; text-align: center;">
      <h2>Erro na aplicação</h2>
      <p>${error.message}</p>
      <button onclick="location.reload()">Recarregar</button>
    </div>
  `;
}
