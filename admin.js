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

// Verificação de autenticação
auth.onAuthStateChanged((user) => {
  console.log("Estado da autenticação:", user ? "Logado" : "Deslogado");
  
  if (user) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    console.log("Detalhes do usuário:", {
      email: user.email,
      uid: user.uid
    });
  } else {
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

  // Feedback visual
  loginBtn.disabled = true;
  loginBtn.textContent = "Entrando...";
  loginError.textContent = "";

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log("Login bem-sucedido:", userCredential.user);
    loginBtn.textContent = "✓ Login realizado!";
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("Erro completo:", error);
    loginError.textContent = getFirebaseAuthErrorMessage(error);
    loginBtn.textContent = "Entrar";
    loginBtn.disabled = false;
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("Usuário deslogado com sucesso");
      window.location.href = "index.html";
    })
    .catch(error => {
      console.error("Erro no logout:", error);
    });
});

// Buscador de endereços (Google Places)
function initAutocomplete() {
  const input = document.getElementById("endereco");
  const options = {
    types: ["establishment"],
    fields: ["name", "geometry"]
  };
  
  const autocomplete = new google.maps.places.Autocomplete(input, options);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    console.log("Local selecionado:", place);
    
    if (!place.geometry) {
      console.warn("Nenhuma geometria disponível para:", place.name);
      return;
    }

    document.getElementById("nome").value = place.name || "";
    document.getElementById("latitude").value = place.geometry.location.lat();
    document.getElementById("longitude").value = place.geometry.location.lng();
  });
}

// Gerenciamento de erros do Firebase Auth
function getFirebaseAuthErrorMessage(error) {
  const errorMap = {
    "auth/invalid-email": "❌ Formato de e-mail inválido",
    "auth/user-disabled": "❌ Conta desativada pelo administrador",
    "auth/user-not-found": "❌ E-mail não cadastrado",
    "auth/wrong-password": "❌ Senha incorreta",
    "auth/too-many-requests": "🔒 Muitas tentativas. Tente mais tarde.",
    "auth/operation-not-allowed": "⚠️ Método de login não habilitado",
    "auth/network-request-failed": "🌐 Falha na conexão"
  };

  console.log("Código do erro:", error.code);
  return errorMap[error.code] || `Erro: ${error.message}`;
}

// Envio do formulário de locais
document.getElementById("add-location-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Publicando...";

    const nome = form.nome.value;
    const lat = parseFloat(form.latitude.value);
    const lng = parseFloat(form.longitude.value);
    const resenha = form.resenha.value;
    const imagemFile = form.imagem.files[0];

    if (!nome || !resenha || isNaN(lat) || isNaN(lng)) {
      throw new Error("Preencha todos os campos obrigatórios!");
    }

    let imagemUrl = "";
    if (imagemFile) {
      imagemUrl = await uploadImageToCloudinary(imagemFile);
    }

    await db.collection("locais").add({
      nome,
      lat,
      lng,
      resenha,
      imagem: imagemUrl,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    submitBtn.textContent = "✓ Publicado!";
    form.reset();
    await new Promise(resolve => setTimeout(resolve, 1500));
  } catch (error) {
    console.error("Erro ao publicar:", error);
    alert(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Upload para Cloudinary
async function uploadImageToCloudinary(file) {
  const cloudName = "dgdjaz541";
  const uploadPreset = "preset_padrao";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Falha no upload");
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Erro no Cloudinary:", error);
    throw new Error("Falha ao enviar imagem");
  }
}

// Inicializações
window.initAutocomplete = initAutocomplete;
