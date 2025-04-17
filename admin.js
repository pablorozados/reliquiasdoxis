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

// Controle de autenticação com verificação reforçada
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário autenticado:", user.email);
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    loadMapsAPI();
    
    // Verifica permissões em tempo real
    testFirestorePermissions();
  } else {
    console.log("Usuário não autenticado");
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// Função para testar permissões do Firestore
async function testFirestorePermissions() {
  try {
    const testDocRef = db.collection("perm_test").doc("temp");
    await testDocRef.set({test: new Date()});
    console.log("Permissões de escrita validadas!");
    await testDocRef.delete();
  } catch (error) {
    console.error("FALHA NAS PERMISSÕES:", error);
    alert("Erro nas permissões. Faça logout e login novamente.");
    auth.signOut();
  }
}

// Sistema de login com validação reforçada
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginBtn = loginForm.querySelector("button[type='submit']");

  loginBtn.disabled = true;
  loginBtn.textContent = "Entrando...";
  loginError.textContent = "";

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log("Login bem-sucedido:", userCredential.user.email);
  } catch (error) {
    console.error("Erro no login:", error);
    loginError.textContent = getErrorMessage(error.code);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";
  }
});

// Logout com limpeza de estado
logoutBtn.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("Logout realizado");
      window.location.reload();
    });
});

// Autocomplete dos lugares (Google Places)
function initAutocomplete() {
  const input = document.getElementById("endereco");
  
  if (!window.google?.maps?.places) {
    console.error("API do Google Maps não carregou");
    input.placeholder = "Recarregue a página para ativar a busca";
    return;
  }

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['establishment'],
    fields: ['name', 'geometry', 'formatted_address'],
    componentRestrictions: { country: "br" }
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    
    if (!place.geometry) {
      alert("Local não encontrado no mapa. Digite um endereço válido.");
      return;
    }

    document.getElementById("nome").value = place.name;
    document.getElementById("latitude").value = place.geometry.location.lat();
    document.getElementById("longitude").value = place.geometry.location.lng();
  });
}

// Upload de imagens para Cloudinary
async function uploadImage(file) {
  const cloudName = "dgdjaz541";
  const uploadPreset = "preset_padrao";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("Falha no upload");
  return await response.json();
}

// Envio do formulário com verificação de autenticação
document.getElementById("add-location-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Verifica se está autenticado
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

    // Adiciona o ID do usuário que criou o registro
    await db.collection("locais").add({
      nome,
      lat,
      lng,
      resenha,
      imagem: imagemUrl,
      userId: auth.currentUser.uid, // Novo campo para segurança
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

// Deletar última resenha com verificação de permissões
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
    const snapshot = await db.collection('locais')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert('Nenhuma resenha encontrada para apagar!');
      return;
    }

    const docToDelete = snapshot.docs[0];
    
    // Verifica se o usuário é o criador (opcional)
    if (docToDelete.data().userId !== auth.currentUser.uid) {
      throw new Error("Você só pode apagar suas próprias resenhas");
    }

    await docToDelete.ref.delete();
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
    "permission-denied": "Sem permissões. Faça login novamente."
  };
  return errors[code] || `Erro desconhecido (${code || 'sem código'})`;
}

// Torna a função global para o callback da API
window.initAutocomplete = initAutocomplete;

// Carrega a API do Maps
function loadMapsAPI() {
  if (window.google && window.google.maps) return;
  
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAPS_API_KEY&libraries=places&callback=initAutocomplete`;
  script.async = true;
  document.head.appendChild(script);
}
