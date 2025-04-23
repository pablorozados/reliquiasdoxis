// Configuração do Firebase (será substituída no deploy)
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  projectId: "FIREBASE_PROJECT_ID",
};

// Inicialização do Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Configuração do Cloudinary
const cloudinaryConfig = {
  cloudName: 'dgdjaz541',
  uploadPreset: 'reliquias_do_xis', // Você precisa criar este preset no Cloudinary!
  sources: ['local'],
  multiple: false,
  clientAllowedFormats: ['jpg', 'png', 'jpeg'],
  maxFileSize: 5000000 // 5MB
};

let imagemUrl = ''; // Armazena a URL da imagem

// Função para abrir o widget do Cloudinary
function openCloudinaryWidget() {
  return new Promise((resolve) => {
    const widget = window.cloudinary.createUploadWidget(
      cloudinaryConfig,
      (error, result) => {
        if (!error && result && result.event === "success") {
          imagemUrl = result.info.secure_url;
          document.getElementById('image-preview').style.display = 'block';
          document.getElementById('preview').src = imagemUrl;
          resolve();
        }
      }
    );
    widget.open();
  });
}

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// 1. SISTEMA DE LOGIN (mantido igual)
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

// 2. VERIFICAR AUTENTICAÇÃO (mantido igual)
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    if (typeof loadMapsAPI === 'function') loadMapsAPI();
  } else {
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// 3. LOGOUT (mantido igual)
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

// 4. FORMULÁRIO PARA ADICIONAR LOCAL (atualizado para Cloudinary)
const addLocationForm = document.getElementById("add-location-form");
if (addLocationForm) {
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
      document.getElementById('image-preview').style.display = 'none';
      imagemUrl = '';
    } catch (error) {
      console.error("Erro ao salvar resenha:", error);
      alert("Erro ao salvar resenha: " + error.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Botão de upload de imagem
  document.getElementById('upload-btn')?.addEventListener('click', openCloudinaryWidget);
}

// 5. Funções do Google Maps (mantidas iguais)
window.initAutocomplete = function() {
  // ... (código existente, não alterado)
};
