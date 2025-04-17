// Configuração do Firebase (USE SUAS CREDENCIAIS REAIS AQUI)
const firebaseConfig = {
  apiKey: "AIzaSyA7_SFUPE6n9KG6LhL9Y6DRanSW5Zn0-2k", // ← Substitua pela sua chave válida
  authDomain: "reliquias-do-xis.firebaseapp.com",
  projectId: "reliquias-do-xis",
  storageBucket: "reliquias-do-xis.appspot.com",
  messagingSenderId: "936551505510",
  appId: "1:936551505510:web:22de1482a8f8d9720257a7"
};

// Inicialização segura do Firebase
try {
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  console.log("Firebase inicializado com sucesso!");
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error);
  alert("Erro crítico: Configuração do Firebase inválida. Verifique o console.");
}

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// Verificação de autenticação
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário logado:", user.email);
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
  } else {
    console.log("Nenhum usuário logado");
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// Sistema de Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginBtn = loginForm.querySelector("button[type='submit']");

  loginBtn.disabled = true;
  loginBtn.textContent = "Autenticando...";
  loginError.textContent = "";

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    loginBtn.textContent = "✓ Login realizado!";
  } catch (error) {
    console.error("Erro de login:", error);
    loginError.textContent = getAuthErrorMessage(error);
    loginBtn.textContent = "Entrar";
  } finally {
    loginBtn.disabled = false;
  }
});

// Mensagens de erro detalhadas
function getAuthErrorMessage(error) {
  const errors = {
    "auth/invalid-email": "E-mail inválido",
    "auth/user-disabled": "Conta desativada",
    "auth/user-not-found": "E-mail não cadastrado",
    "auth/wrong-password": "Senha incorreta",
    "auth/api-key-not-valid": "CHAVE DE API INVÁLIDA - Configure corretamente no Firebase"
  };
  return errors[error.code] || "Erro ao fazer login";
}

// Logout
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut()
    .then(() => window.location.href = "index.html");
});

// Inicialização do Places API (AGORA FUNCIONAL)
function initAutocomplete() {
  const input = document.getElementById("endereco");
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["establishment"],
    fields: ["name", "geometry"]
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    
    document.getElementById("nome").value = place.name;
    document.getElementById("latitude").value = place.geometry.location.lat();
    document.getElementById("longitude").value = place.geometry.location.lng();
  });
}

// Garante que a função seja global
window.initAutocomplete = initAutocomplete;

// Carrega o Maps API de forma assíncrona
function loadMapsAPI() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=SUA_CHAVE_GOOGLE_MAPS&libraries=places&callback=initAutocomplete`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Inicializa tudo quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  loadMapsAPI();
});
