// Configuração do Firebase
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  projectId: "FIREBASE_PROJECT_ID"
};

// Inicialização do Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variáveis globais
let imagemUrl = '';
let selectedNota = 0;
let selectedSujeira = 0;
let selectedCagada = 0;

// Configuração do Cloudinary
const cloudinaryConfig = {
  cloudName: 'dgdjaz541',
  uploadPreset: 'reliquias_do_xis'
};

function openCloudinaryWidget() {
  const widget = window.cloudinary.createUploadWidget(cloudinaryConfig, 
    (error, result) => {
      if (result?.event === "success") {
        imagemUrl = result.info.secure_url;
        document.getElementById('preview').src = imagemUrl;
        document.getElementById('image-preview').style.display = 'block';
      }
    }
  );
  widget.open();
}

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

// Contador de caracteres para "Meu Pedido"
function setupCharCounter() {
  const pedidoField = document.getElementById('meu-pedido');
  const counter = document.getElementById('pedido-counter');
  
  pedidoField.addEventListener('input', () => {
    counter.textContent = pedidoField.value.length;
  });
}

// Inicialização dos ratings
function setupRatings() {
  // Nota (estrelas)
  const notaOptions = document.querySelectorAll('#nota-rating .rating-option');
  notaOptions.forEach(option => {
    option.addEventListener('click', () => {
      notaOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedNota = parseInt(option.dataset.value);
    });
  });

  // Sujeira comendo (hambúrgueres)
  const sujeiraOptions = document.querySelectorAll('#sujeira-rating .rating-option');
  sujeiraOptions.forEach(option => {
    option.addEventListener('click', () => {
      sujeiraOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedSujeira = parseInt(option.dataset.value);
    });
  });

  // Cagada depois (cocôs)
  const cagadaOptions = document.querySelectorAll('#cagada-rating .rating-option');
  cagadaOptions.forEach(option => {
    option.addEventListener('click', () => {
      cagadaOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedCagada = parseInt(option.dataset.value);
    });
  });
}

// Formulário para Adicionar Local
const addLocationForm = document.getElementById("add-location-form");
if (addLocationForm) {
  // Inicializa os ratings e contador
  setupRatings();
  setupCharCounter();

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
      // Validação dos campos obrigatórios
      const meuPedido = document.getElementById('meu-pedido').value.trim();
      
      if (selectedNota === 0 || selectedSujeira === 0 || selectedCagada === 0 || !meuPedido) {
        alert("Por favor, preencha todos os campos obrigatórios");
        return;
      }

      const nome = document.getElementById('nome').value;
      const latitude = parseFloat(document.getElementById('latitude').value);
      const longitude = parseFloat(document.getElementById('longitude').value);
      const resenha = document.getElementById('resenha').value;

      if (!nome || isNaN(latitude) || isNaN(longitude) || !resenha) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
      }

      // Dados para salvar no Firestore
      const localData = {
        nome,
        latitude,
        longitude,
        resenha,
        meu_pedido: meuPedido,
        nota: selectedNota,
        sujeira_comendo: selectedSujeira,
        cagada_depois: selectedCagada,
        userId: auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (imagemUrl) localData.imagem = imagemUrl;

      // Salva no Firestore
      await db.collection("locais").add(localData);
      alert("Resenha publicada com sucesso!");
      
      // Reseta o formulário
      addLocationForm.reset();
      document.getElementById('image-preview').style.display = 'none';
      document.getElementById('pedido-counter').textContent = '0';
      imagemUrl = '';
      
      // Reseta as avaliações
      selectedNota = 0;
      selectedSujeira = 0;
      selectedCagada = 0;
      document.querySelectorAll('.rating-option').forEach(opt => {
        opt.classList.remove('selected');
      });
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Erro ao publicar resenha. Por favor, tente novamente.");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Botão para apagar última resenha
const deleteBtn = document.getElementById('delete-btn');
if (deleteBtn) {
  deleteBtn.addEventListener('click', async () => {
    if (!auth.currentUser) {
      alert("Por favor, faça login novamente.");
      return;
    }

    if (!confirm('Tem certeza que deseja apagar sua última resenha?')) return;

    try {
      const query = await db.collection("locais")
        .where("userId", "==", auth.currentUser.uid)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (query.empty) {
        alert("Nenhuma resenha encontrada para apagar.");
        return;
      }

      const doc = query.docs[0];
      await db.collection("locais").doc(doc.id).delete();
      alert("Resenha apagada com sucesso!");
    } catch (error) {
      console.error("Erro ao apagar:", error);
      alert("Erro ao apagar resenha. Por favor, tente novamente.");
    }
  });
}
