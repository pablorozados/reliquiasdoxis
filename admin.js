// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variável para controlar o redirecionamento
let shouldCheckAuth = false;

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// Verificação de autenticação MODIFICADA
auth.onAuthStateChanged((user) => {
  if (!shouldCheckAuth) return; // Não faz nada até a página estar pronta
  
  if (user) {
    // Usuário logado - mostra painel admin
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
  } else {
    // Usuário não logado - mostra formulário de login
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// Quando a página estiver totalmente carregada
window.addEventListener('DOMContentLoaded', () => {
  // Habilita a verificação de autenticação
  shouldCheckAuth = true;
  
  // Força uma verificação do estado atual
  auth.currentUser?.reload().then(() => {
    // Atualiza a UI baseada no estado de autenticação
    if (auth.currentUser) {
      loginSection.style.display = "none";
      adminPanel.style.display = "block";
    } else {
      loginSection.style.display = "block";
      adminPanel.style.display = "none";
    }
  });
});

// Sistema de Login Aprimorado
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginBtn = loginForm.querySelector("button[type='submit']");

  // Feedback visual
  loginBtn.disabled = true;
  loginBtn.textContent = "Entrando...";
  loginError.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // Login bem-sucedido - a mudança será tratada pelo onAuthStateChanged
  } catch (error) {
    loginError.textContent = "E-mail ou senha inválidos.";
    loginBtn.textContent = "Entrar";
    loginBtn.disabled = false;
    console.error("Erro no login:", error);
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      window.location.href = "index.html"; // Redireciona após logout
    });
});

// Restante do seu código (Places API, formulário, etc.)...
// [Manter todo o restante do código que já estava funcionando]
