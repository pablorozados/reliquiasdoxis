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

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// Verificação de autenticação MODIFICADA
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário autenticado:", user.email);
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
  } else {
    console.log("Nenhum usuário autenticado");
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
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
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log("Login bem-sucedido:", userCredential.user);
    loginBtn.textContent = "✓ Login realizado!";
    
    // Pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error("Erro no login:", error);
    loginError.textContent = getErrorMessage(error.code);
    loginBtn.textContent = "Entrar";
    loginBtn.disabled = false;
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("Logout realizado com sucesso");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Erro no logout:", error);
    });
});

// Helper para mensagens de erro
function getErrorMessage(errorCode) {
  const messages = {
    "auth/invalid-email": "E-mail inválido",
    "auth/user-disabled": "Conta desativada",
    "auth/user-not-found": "Usuário não encontrado",
    "auth/wrong-password": "Senha incorreta",
    "auth/too-many-requests": "Muitas tentativas. Tente mais tarde."
  };
  return messages[errorCode] || "Erro ao fazer login";
}

// Buscador de endereços (Google Places)
function initAutocomplete() {
  const autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("endereco"),
    { types: ["establishment"] }
  );

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      console.log("Local não encontrado");
      return;
    }

    document.getElementById("nome").value = place.name;
    document.getElementById("latitude").value = place.geometry.location.lat();
    document.getElementById("longitude").value = place.geometry.location.lng();
  });
}

// Inicializa o Places API
window.initAutocomplete = initAutocomplete;
