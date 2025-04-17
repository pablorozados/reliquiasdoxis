// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA7_SFUPE6n9KG6LhL9Y6DRanSW5Zn0-2k",
  authDomain: "reliquias-do-xis.firebaseapp.com",
  projectId: "reliquias-do-xis",
  storageBucket: "reliquias-do-xis.appspot.com",
  messagingSenderId: "936551505510",
  appId: "1:936551505510:web:22de1482a8f8d9720257a7"
};

// Inicialização do Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// 1. SISTEMA DE LOGIN CORRIGIDO (SIMPLIFICADO)
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginBtn = loginForm.querySelector("button[type='submit']");

  loginBtn.disabled = true;
  loginError.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    initAdminFeatures(); // Carrega todas as funções do admin
  } catch (error) {
    loginError.textContent = "E-mail ou senha incorretos";
    console.error("Erro login:", error);
  } finally {
    loginBtn.disabled = false;
  }
});

// 2. FUNÇÃO PRINCIPAL DO ADMIN
function initAdminFeatures() {
  addGerenciarButton();
  setupMap();
  setupDeleteButton();
  setupLogout();
}

// 3. BOTÃO GERENCIAR (SIMPLIFICADO)
function addGerenciarButton() {
  const actionsDiv = document.querySelector(".action-buttons");
  if (!actionsDiv || document.getElementById("gerenciar-btn")) return;

  const gerenciarBtn = document.createElement("a");
  gerenciarBtn.id = "gerenciar-btn";
  gerenciarBtn.href = "gerenciar.html";
  gerenciarBtn.textContent = "📋 Gerenciar Todas";
  gerenciarBtn.className = "gerenciar-btn";
  actionsDiv.prepend(gerenciarBtn);
}

// 4. CONFIGURAÇÃO DO MAPA (VERSÃO SIMPLES)
function setupMap() {
  const input = document.getElementById("endereco");
  if (!input) return;

  input.placeholder = "Digite o endereço...";
  
  // Carrega a API apenas quando necessário
  if (!window.google) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=SUA_CHAVE_AQUI&libraries=places`;
    script.async = true;
    script.onload = () => initAutocomplete();
    document.head.appendChild(script);
  } else {
    initAutocomplete();
  }
}

function initAutocomplete() {
  const input = document.getElementById("endereco");
  if (!window.google || !window.google.maps) {
    input.placeholder = "Recarregue para ativar a busca";
    return;
  }

  try {
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["establishment"],
      fields: ["name", "geometry"],
      componentRestrictions: { country: "br" }
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        document.getElementById("nome").value = place.name;
        document.getElementById("latitude").value = place.geometry.location.lat();
        document.getElementById("longitude").value = place.geometry.location.lng();
      }
    });
  } catch (error) {
    console.error("Erro no autocomplete:", error);
    input.placeholder = "Busca indisponível";
  }
}

// 5. BOTÃO DE LOGOUT
function setupLogout() {
  logoutBtn.addEventListener("click", () => auth.signOut());
}

// 6. BOTÃO DELETAR (VERSÃO SIMPLES)
function setupDeleteButton() {
  document.getElementById("delete-btn")?.addEventListener("click", async () => {
    if (!confirm("Apagar última resenha?")) return;
    
    const deleteBtn = document.getElementById("delete-btn");
    deleteBtn.disabled = true;
    
    try {
      const snapshot = await db.collection("locais")
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (!snapshot.empty) {
        await snapshot.docs[0].ref.delete();
        alert("Resenha apagada!");
      }
    } catch (error) {
      console.error("Erro ao apagar:", error);
      alert("Erro ao apagar");
    } finally {
      deleteBtn.disabled = false;
    }
  });
}

// Verifica autenticação ao carregar
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    initAdminFeatures();
  }
});
