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

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

// 1. SISTEMA DE LOGIN (SIMPLIFICADO)
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
    loadGoogleMapsAPI(); // Só carrega o Maps após login
  } catch (error) {
    loginError.textContent = "E-mail ou senha incorretos";
  } finally {
    loginBtn.disabled = false;
  }
});

// 2. GOOGLE MAPS (VERSÃO À PROVA DE FALHAS)
let mapsLoaded = false;

function loadGoogleMapsAPI() {
  if (mapsLoaded) return;
  
  // Fallback caso a API não carregue
  const fallback = () => {
    const input = document.getElementById("endereco");
    if (input) input.placeholder = "Busca manual (serviço indisponível)";
  };

  // Verifica se já está carregado
  if (window.google && window.google.maps) {
    initAutocomplete();
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAPS_API_KEY&libraries=places&callback=initAutocomplete`;
  script.async = true;
  script.defer = true;
  script.onerror = fallback;
  
  document.head.appendChild(script);
  mapsLoaded = true;
}

// 3. AUTCOMPLETE (COM FALLBACK)
function initAutocomplete() {
  const input = document.getElementById("endereco");
  if (!input) return;

  try {
    // Tenta a API nova (PlaceAutocompleteElement)
    if (window.google.maps.places?.PlaceAutocompleteElement) {
      const autocomplete = new google.maps.places.PlaceAutocompleteElement({
        inputElement: input,
        componentRestrictions: { country: "br" }
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.geometry) {
          document.getElementById("nome").value = place.name || "";
          document.getElementById("latitude").value = place.geometry.location.lat();
          document.getElementById("longitude").value = place.geometry.location.lng();
        }
      });
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
        if (place.geometry) {
          document.getElementById("nome").value = place.name;
          document.getElementById("latitude").value = place.geometry.location.lat();
          document.getElementById("longitude").value = place.geometry.location.lng();
        }
      });
    }
  } catch (error) {
    console.error("Erro no autocomplete:", error);
    input.placeholder = "Digite o endereço manualmente";
  }
}

// 4. VERIFICA AUTENTICAÇÃO AO CARREGAR
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    loadGoogleMapsAPI();
  }
});
