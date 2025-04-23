// Configuração do Firebase
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  projectId: "FIREBASE_PROJECT_ID",
};

// Inicialização do Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Configuração do Cloudinary (ALTERAÇÃO PRINCIPAL)
const cloudinaryConfig = {
  cloudName: 'dgdjaz541',
  uploadPreset: 'reliquias_do_xis',
  sources: ['local'],
  multiple: false,
  clientAllowedFormats: ['jpg', 'png', 'jpeg'],
  maxFileSize: 5000000 // 5MB
};

let imagemUrl = '';

// Função para abrir o widget do Cloudinary (ALTERAÇÃO PRINCIPAL)
function openCloudinaryWidget() {
  const widget = window.cloudinary.createUploadWidget(cloudinaryConfig, 
    (error, result) => {
      if (!error && result && result.event === "success") {
        imagemUrl = result.info.secure_url;
        const preview = document.getElementById('preview');
        const imagePreview = document.getElementById('image-preview');
        if (preview && imagePreview) {
          preview.src = imagemUrl;
          imagePreview.style.display = 'block';
        }
      }
    }
  );
  widget.open();
}

// -------------------------------------------------------------------
// TUDO ABAIXO PERMANECE EXATAMENTE IGUAL (NÃO MODIFICADO)
// -------------------------------------------------------------------

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// Sistema de Login
if (loginForm) {
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
      if (typeof loadMapsAPI === 'function') loadMapsAPI();
    } catch (error) {
      loginError.textContent = "E-mail ou senha incorretos";
      console.error("Erro ao fazer login:", error);
    } finally {
      loginBtn.disabled = false;
    }
  });
}

// Verificar Autenticação
auth.onAuthStateChanged(user => {
  if (user) {
    if (loginSection) loginSection.style.display = "none";
    if (adminPanel) adminPanel.style.display = "block";
    if (typeof loadMapsAPI === 'function') loadMapsAPI();
  } else {
    if (loginSection) loginSection.style.display = "block";
    if (adminPanel) adminPanel.style.display = "none";
  }
});

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      console.log("Usuário deslogado");
      window.location.reload();
    }).catch(error => {
      console.error("Erro ao fazer logout:", error);
    });
  });
}

// Formulário para Adicionar Local
const addLocationForm = document.getElementById("add-location-form");
if (addLocationForm) {
  // Botão de upload
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', openCloudinaryWidget);
  }

  addLocationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = addLocationForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    try {
      const nome = document.getElementById('nome').value;
      const latitude = parseFloat(document.getElementById('latitude').value);
      const longitude = parseFloat(document.getElementById('longitude').value);
      const resenha = document.getElementById('resenha').value;

      if (!nome || isNaN(latitude) || isNaN(longitude) || !resenha) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
      }

      const localData = {
        nome,
        latitude,
        longitude,
        resenha,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (imagemUrl) localData.imagem = imagemUrl;

      await db.collection("locais").add(localData);
      alert("Resenha publicada com sucesso!");
      addLocationForm.reset();
      
      const
