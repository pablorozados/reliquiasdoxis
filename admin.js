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

// Debug para verificar se o Firebase está inicializado
console.log("Firebase inicializado:", app.options.projectId);

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// Variável para controlar se o Maps já foi carregado
window.mapsLoaded = false;

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
    if (typeof loadMapsAPI === 'function') {
      loadMapsAPI(); // Só carrega o Maps após login
    }
  } catch (error) {
    loginError.textContent = "E-mail ou senha incorretos";
    console.error("Erro ao fazer login:", error);
  } finally {
    loginBtn.disabled = false;
  }
});

// 2. FUNÇÃO DE AUTOCOMPLETAR (CALLBACK DO GOOGLE MAPS)
// IMPORTANTE: Deve ser exposta globalmente para a API do Google Maps chamá-la
window.initAutocomplete = function() {
  console.log("initAutocomplete chamado!");
  const input = document.getElementById("endereco");
  if (!input) return;

  try {
    // Tenta a API nova (PlaceAutocompleteElement)
    if (window.google.maps.places?.PlaceAutocompleteElement) {
      console.log("Usando PlaceAutocompleteElement");
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
          console.log("Local selecionado:", place.name);
        }
      });
    } 
    // Fallback para API legada
    else if (window.google.maps.places?.Autocomplete) {
      console.log("Usando Autocomplete (API legada)");
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["establishment"],
        fields: ["name", "geometry", "formatted_address"],
        componentRestrictions: { country: "br" }
      });
      
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        console.log("Place data:", place);
        
        if (place.geometry) {
          document.getElementById("nome").value = place.name || "";
          document.getElementById("latitude").value = place.geometry.location.lat();
          document.getElementById("longitude").value = place.geometry.location.lng();
          console.log("Local selecionado:", place.name);
        } else {
          console.warn("Local sem coordenadas");
        }
      });
    } else {
      console.error("APIs do Google Places não encontradas");
      input.placeholder = "Digite manualmente (API indisponível)";
    }
  } catch (error) {
    console.error("Erro ao inicializar autocomplete:", error);
    input.placeholder = "Digite o endereço manualmente";
  }
};

// 3. VERIFICAR AUTENTICAÇÃO AO CARREGAR
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    if (typeof loadMapsAPI === 'function') {
      loadMapsAPI();
    }
  } else {
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// 4. LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      console.log("Usuário deslogado");
      window.location.reload(); // Recarrega a página após logout
    }).catch(error => {
      console.error("Erro ao fazer logout:", error);
    });
  });
}

// 5. FORMULÁRIO PARA ADICIONAR LOCAL
const addLocationForm = document.getElementById("add-location-form");
if (addLocationForm) {
  addLocationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = addLocationForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    
    try {
      // Implementar lógica para salvar no Firebase
      // (você provavelmente já tem isso implementado em outro lugar)
      
      // Exemplo básico:
      /*
      await db.collection("locais").add({
        nome: document.getElementById("nome").value,
        lat: parseFloat(document.getElementById("latitude").value),
        lng: parseFloat(document.getElementById("longitude").value),
        resenha: document.getElementById("resenha").value,
        userId: auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      */
      
      submitBtn.textContent = "Publicado!";
      setTimeout(() => {
        submitBtn.textContent = "Publicar";
        addLocationForm.reset();
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// 6. DELETAR ÚLTIMA RESENHA
const deleteBtn = document.getElementById("delete-btn");
if (deleteBtn) {
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Tem certeza que deseja apagar a última resenha?")) return;
    
    try {
      // Implementar lógica para deletar a última resenha
      // (você provavelmente já tem isso implementado em outro lugar)
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar: " + error.message);
    }
  });
}

// Debug para verificar se o script carregou completamente
console.log("admin.js carregado completamente");
