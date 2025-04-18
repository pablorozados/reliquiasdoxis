// Configuração do Firebase (será substituída no deploy)
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "reliquias-do-xis.firebaseapp.com",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "reliquias-do-xis.appspot.com",
  messagingSenderId: "936551505510",
  appId: "1:936551505510:web:22de1482a8f8d9720257a7"
};

// Inicialização do Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Debug - verifique no console
console.log("Firebase inicializado:", app.options.projectId);

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// 1. SISTEMA DE LOGIN
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
    loadGoogleMapsAPI(); // Carrega o Maps após login
  } catch (error) {
    loginError.textContent = "E-mail ou senha incorretos";
    console.error("Erro login:", error);
  } finally {
    loginBtn.disabled = false;
  }
});

// 2. GOOGLE MAPS (VERSÃO ROBUSTA)
let mapsLoaded = false;

function loadGoogleMapsAPI() {
  if (mapsLoaded) return;
  
  // Fallback para quando a API não carrega
  const fallback = () => {
    const input = document.getElementById("endereco");
    if (input) {
      input.placeholder = "Digite manualmente (serviço indisponível)";
      console.error("Falha ao carregar Google Maps API");
    }
  };

  // Se já estiver carregado, só inicializa
  if (window.google && window.google.maps) {
    initAutocomplete();
    return;
  }

  // Carrega a API do Maps
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAPS_API_KEY&libraries=places&callback=initAutocomplete&loading=async`;
  script.async = true;
  script.defer = true;
  script.onerror = fallback;
  
  document.head.appendChild(script);
  mapsLoaded = true;
  console.log("Google Maps API carregando...");
}

// 3. AUTCOMPLETE (COM FALLBACK)
function initAutocomplete() {
  const input = document.getElementById("endereco");
  if (!input) return;

  try {
    // Tenta usar a API nova (recomendada)
    if (window.google.maps.places?.PlaceAutocompleteElement) {
      const autocomplete = new google.maps.places.PlaceAutocompleteElement({
        inputElement: input,
        componentRestrictions: { country: "br" }
      });
      
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        updateFormWithPlace(place);
      });
      
      console.log("Usando PlaceAutocompleteElement (nova API)");
    } 
    // Fallback para API legada
    else if (window.google.maps.places?.Autocomplete) {
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["establishment"],
        fields: ["name", "geometry"],
        componentRestrictions: { country: "br" }
      });
      
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        updateFormWithPlace(place);
      });
      
      console.log("Usando Autocomplete (API legada)");
    }
  } catch (error) {
    console.error("Erro no autocomplete:", error);
    if (input) input.placeholder = "Erro na busca - Digite manualmente";
  }
}

// 4. ATUALIZA FORMULÁRIO COM OS DADOS DO LOCAL
function updateFormWithPlace(place) {
  if (!place?.geometry) {
    console.log("Local sem coordenadas:", place?.name);
    return;
  }

  document.getElementById("nome").value = place.name || "";
  document.getElementById("latitude").value = place.geometry.location.lat();
  document.getElementById("longitude").value = place.geometry.location.lng();
  console.log("Local selecionado:", place.name);
}

// 5. CONTROLE DE AUTENTICAÇÃO
auth.onAuthStateChanged((user) => {
  if (user) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    loadGoogleMapsAPI();
  } else {
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// 6. LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth.signOut();
    console.log("Usuário deslogado");
  });
}
