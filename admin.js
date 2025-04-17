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

// Controle de autenticação
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário autenticado:", user.email);
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    loadMapsAPI().catch(console.error);
  } else {
    console.log("Usuário não autenticado");
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// Sistema de login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginBtn = loginForm.querySelector("button[type='submit']");

  loginBtn.disabled = true;
  loginBtn.textContent = "Entrando...";
  loginError.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error("Erro no login:", error);
    loginError.textContent = getErrorMessage(error.code);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// Autocomplete moderno (recomendado pelo Google)
function initAutocomplete() {
  const input = document.getElementById("endereco");
  
  if (!window.google?.maps?.places?.Autocomplete) {
    console.error("API do Places não carregou corretamente");
    input.placeholder = "Recarregue a página para ativar a busca";
    return;
  }

  try {
    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ["name", "geometry"],
      types: ["establishment"],
      componentRestrictions: { country: "br" }
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry) {
        alert("Local não encontrado. Por favor, selecione uma opção da lista.");
        return;
      }

      document.getElementById("nome").value = place.name;
      document.getElementById("latitude").value = place.geometry.location.lat();
      document.getElementById("longitude").value = place.geometry.location.lng();
    });
  } catch (error) {
    console.error("Erro no Autocomplete:", error);
    input.placeholder = "Erro na busca. Atualize a página.";
  }
}

// Upload de imagens para Cloudinary
async function uploadImage(file) {
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
    return await response.json();
  } catch (error) {
    console.error("Erro no upload:", error);
    throw error;
  }
}

// Envio do formulário
document.getElementById("add-location-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!auth.currentUser) {
    alert("Faça login antes de publicar");
    return;
  }

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
      const result = await uploadImage(imagemFile);
      imagemUrl = result.secure_url;
    }

    await db.collection("locais").add({
      nome,
      lat,
      lng,
      resenha,
      imagem: imagemUrl,
      userId: auth.currentUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    submitBtn.textContent = "✓ Publicado!";
    form.reset();
  } catch (error) {
    console.error("Erro ao publicar:", error);
    alert(`Erro: ${error.message}\n\nCódigo: ${error.code || 'N/A'}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Deletar última resenha
document.getElementById('delete-btn').addEventListener('click', async () => {
  if (!auth.currentUser) {
    alert("Faça login antes de apagar");
    return;
  }

  if (!confirm('ATENÇÃO: Isso apagará permanentemente a última resenha adicionada. Continuar?')) return;
  
  const deleteBtn = document.getElementById('delete-btn');
  deleteBtn.disabled = true;
  deleteBtn.textContent = "Apagando...";

  try {
    const snapshot = await db.collection("locais")
      .where("userId", "==", auth.currentUser.uid)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert('Nenhuma resenha encontrada para apagar!');
      return;
    }

    await snapshot.docs[0].ref.delete();
    alert('Resenha apagada com sucesso!');
  } catch (error) {
    console.error("Erro ao apagar:", error);
    alert(`Erro: ${error.message}\n\nCódigo: ${error.code || 'N/A'}`);
  } finally {
    deleteBtn.disabled = false;
    deleteBtn.textContent = "🗑️ Apagar Última Resenha";
  }
});

// Helper para mensagens de erro
function getErrorMessage(code) {
  const errors = {
    "auth/invalid-email": "E-mail inválido",
    "auth/user-not-found": "E-mail não cadastrado",
    "auth/wrong-password": "Senha incorreta",
    "auth/too-many-requests": "Muitas tentativas. Tente mais tarde.",
    "permission-denied": "Sem permissões. Contate o administrador.",
    "missing-permissions": "Você não tem permissão para esta ação"
  };
  return errors[code] || `Erro desconhecido (${code || 'sem código'})`;
}

// Torna a função global para o callback da API
window.initAutocomplete = initAutocomplete;
