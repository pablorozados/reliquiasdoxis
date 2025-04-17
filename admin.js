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

// 1. SISTEMA DE LOGIN CORRIGIDO
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginBtn = loginForm.querySelector("button[type='submit']");

  loginBtn.disabled = true;
  loginError.textContent = "";
  loginBtn.textContent = "Entrando...";

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Login bem-sucedido
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    loadMapsAPI();
    addGerenciarButton();
    
  } catch (error) {
    let errorMessage = "Erro ao fazer login";
    if (error.code === "auth/wrong-password") errorMessage = "Senha incorreta";
    if (error.code === "auth/user-not-found") errorMessage = "Usuário não encontrado";
    
    loginError.textContent = errorMessage;
    console.error("Erro login:", error);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";
  }
});

// 2. CARREGAMENTO DO MAPA ATUALIZADO
function loadMapsAPI() {
  return new Promise((resolve) => {
    if (window.google?.maps?.places?.PlaceAutocompleteElement) {
      initAutocomplete();
      resolve();
      return;
    }

    const callbackName = 'mapInit_' + Math.floor(Math.random() * 10000);
    window[callbackName] = () => {
      delete window[callbackName];
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAPS_API_KEY&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Falha ao carregar Google Maps");
      document.getElementById('endereco').placeholder = 'Serviço indisponível';
    };
    document.head.appendChild(script);
  });
}

// 3. AUTCOMPLETE ATUALIZADO
function initAutocomplete() {
  const input = document.getElementById("endereco");
  if (!input) return;

  try {
    // Método moderno (recomendado)
    if (window.google.maps.places.PlaceAutocompleteElement) {
      const autocomplete = new google.maps.places.PlaceAutocompleteElement({
        inputElement: input,
        componentRestrictions: { country: "br" }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        updateFormFields(place);
      });
      return;
    }

    // Fallback para método legado
    const legacyAutocomplete = new google.maps.places.Autocomplete(input, {
      types: ['establishment'],
      fields: ['name', 'geometry'],
      componentRestrictions: { country: "br" }
    });

    legacyAutocomplete.addListener("place_changed", () => {
      const place = legacyAutocomplete.getPlace();
      updateFormFields(place);
    });

  } catch (error) {
    console.error("Erro no autocomplete:", error);
    input.placeholder = "Erro na busca. Recarregue a página.";
  }
}

function updateFormFields(place) {
  if (!place?.geometry?.location) {
    console.log("Local sem coordenadas válidas");
    return;
  }
  
  document.getElementById("nome").value = place.name || "";
  document.getElementById("latitude").value = place.geometry.location.lat();
  document.getElementById("longitude").value = place.geometry.location.lng();
}

// [RESTANTE DO CÓDIGO PERMANECE IGUAL...]
// (Funções addGerenciarButton, uploadImage, deleteBtn, etc)
