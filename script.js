// Configurações do Cloudinary
const cloudName = "dgdjaz541"; // Substitua pelo seu Cloud Name
const uploadPreset = "preset_padrao"; // Seu upload preset

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

// Variáveis globais
let map;

// Verifica autenticação ao carregar a página
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário logado:", user.email);
    document.getElementById("login-section").style.display = "none";
    document.getElementById("add-location-section").style.display = "block";
    carregarLocais();
  } else {
    console.log("Nenhum usuário logado.");
    document.getElementById("login-section").style.display = "block";
    document.getElementById("add-location-section").style.display = "none";
  }
});

// Inicializa o mapa
function initMap() {
  const centro = { lat: -30.0346, lng: -51.2177 }; // Porto Alegre
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: centro,
  });
}

// Buscador de endereços (Google Places API)
function initAutocomplete() {
  const input = document.getElementById("endereco");
  const autocomplete = new google.maps.places.Autocomplete(input);
  
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    
    document.getElementById("nome").value = place.name;
    document.getElementById("latitude").value = place.geometry.location.lat();
    document.getElementById("longitude").value = place.geometry.location.lng();
  });
}

// Login
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => console.log("Login feito!"))
    .catch((error) => {
      console.error("Erro no login:", error);
      document.getElementById("login-error").textContent = "E-mail ou senha inválidos.";
    });
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut().then(() => console.log("Usuário deslogado"));
});

// Carrega locais do Firestore
function carregarLocais() {
  db.collection("locais").orderBy("timestamp", "desc").get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => adicionarMarcador(doc.data()));
    })
    .catch((error) => {
      console.error("Erro ao carregar locais:", error);
    });
}

// Upload de imagem para Cloudinary
async function uploadImage(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(url, { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    return data.secure_url;
  } catch (error) {
    console.error("Falha no upload:", error);
    alert("Erro ao enviar imagem. Tente novamente!");
    return null;
  }
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
    imagemUrl = await uploadImage(imagemFile);
    if (!imagemUrl) return;
  }

  // Salva no Firestore
  await db.collection("locais").add({
    nome, lat, lng, resenha, imagem: imagemUrl,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  alert("Resenha publicada com sucesso!");
  e.target.reset();
});

// Adiciona marcador no mapa
function adicionarMarcador(local) {
  const marker = new google.maps.Marker({
    position: { lat: local.lat, lng: local.lng },
    map: map,
    title: local.nome,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <h3>${local.nome}</h3>
      <p>${local.resenha}</p>
      ${local.imagem ? `<img src="${local.imagem}" alt="${local.nome}" style="max-width: 200px;">` : ""}
    `,
  });

  marker.addListener("click", () => infoWindow.open(map, marker));
}

// Inicializa tudo
window.initMap = initMap;
window.initAutocomplete = initAutocomplete;
