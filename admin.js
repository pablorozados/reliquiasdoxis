// Configuração do Firebase (repetida aqui para evitar dependências)
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

// Verificação de autenticação (redireciona se não estiver logado)
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html"; // Força redirecionamento
  } else {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
  }
});

// Login
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch((error) => {
      document.getElementById("login-error").textContent = "E-mail ou senha inválidos.";
    });
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut().then(() => window.location.reload());
});

// Buscador de endereços (Google Places)
function initAutocomplete() {
  const autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("endereco")
  );

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    document.getElementById("nome").value = place.name;
    document.getElementById("latitude").value = place.geometry.location.lat();
    document.getElementById("longitude").value = place.geometry.location.lng();
  });
}

// Envio do formulário
document.getElementById("add-location-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);
  const resenha = document.getElementById("resenha").value;
  const imagemFile = document.getElementById("imagem").files[0];

  if (!nome || !resenha || isNaN(lat) || isNaN(lng)) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  // Upload da imagem (se existir)
  let imagemUrl = "";
  if (imagemFile) {
    const cloudName = "dgdjaz541";
    const uploadPreset = "preset_padrao";
    const formData = new FormData();
    formData.append("file", imagemFile);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      imagemUrl = data.secure_url;
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Falha ao enviar imagem. Tente novamente!");
      return;
    }
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

  alert("Resenha publicada com sucesso!");
  e.target.reset();
});
