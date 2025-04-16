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

// Estado de autenticação
let isRedirecting = false;

// Verificação de autenticação (com tratamento de redirecionamento)
auth.onAuthStateChanged((user) => {
  if (!user && !isRedirecting) {
    isRedirecting = true;
    console.log("Usuário não autenticado. Redirecionando em 2 segundos...");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000); // Delay para evitar flicker
  } else if (user) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
  }
});

// Login com feedback visual
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
    loginBtn.textContent = "✓ Login bem-sucedido!";
    await new Promise(resolve => setTimeout(resolve, 1000)); // Feedback visual
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
      console.log("Logout realizado");
      window.location.href = "index.html";
    });
});

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

// Envio do formulário (com tratamento aprimorado)
document.getElementById("add-location-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector("button[type='submit']");
  const originalBtnText = submitBtn.textContent;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Publicando...";

    // Validação
    const nome = form.nome.value;
    const lat = parseFloat(form.latitude.value);
    const lng = parseFloat(form.longitude.value);
    const resenha = form.resenha.value;

    if (!nome || !resenha || isNaN(lat) || isNaN(lng)) {
      throw new Error("Preencha todos os campos obrigatórios!");
    }

    // Upload de imagem (se existir)
    let imagemUrl = "";
    if (form.imagem.files[0]) {
      const uploadData = await handleImageUpload(form.imagem.files[0]);
      imagemUrl = uploadData.secure_url;
    }

    // Salva no Firestore
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
    console.error("Erro:", error);
    alert(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
});

// Upload de imagem para Cloudinary
async function handleImageUpload(file) {
  const cloudName = "dgdjaz541";
  const uploadPreset = "preset_padrao";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("Falha no upload da imagem");
  return await response.json();
}

// Inicializa o Places API
window.initAutocomplete = initAutocomplete;
