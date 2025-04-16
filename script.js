// Configurações do Cloudinary
const cloudName = "dgdjaz541"; // Substitua pelo seu Cloud Name
const uploadPreset = "preset_padrao"; // Crie um upload preset no Cloudinary

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variável global para controle do mapa
let map;

// Verifica autenticação ao carregar a página
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário logado:", user.email);
    document.getElementById("login-section").style.display = "none";
    document.getElementById("add-location-section").style.display = "block";
    carregarLocais(); // Carrega locais existentes
  } else {
    console.log("Nenhum usuário logado.");
    document.getElementById("login-section").style.display = "block";
    document.getElementById("add-location-section").style.display = "none";
  }
});

// Inicializa o mapa do Google Maps
function initMap() {
  const centro = { lat: -30.0346, lng: -51.2177 }; // Porto Alegre
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: centro,
  });
}

// Função de login
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Usuário autenticado:", userCredential.user);
    })
    .catch((error) => {
      console.error("Erro no login:", error);
      document.getElementById("login-error").textContent = "Erro no login. Verifique e-mail e senha.";
    });
});

// Função de logout
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut().then(() => {
    console.log("Usuário deslogado");
  });
});

// Carrega locais do Firestore
function carregarLocais() {
  db.collection("locais").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      adicionarMarcador(doc.data());
    });
  }).catch((error) => {
    console.error("Erro ao carregar locais:", error);
  });
}

// Upload de imagem para Cloudinary (com tratamento de erros)
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

// Adiciona novo local (com validação)
document.getElementById("add-location-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);
  const resenha = document.getElementById("resenha").value;
  const imagemInput = document.getElementById("imagem");

  // Valida coordenadas
  if (isNaN(lat) || isNaN(lng)) {
    alert("Coordenadas inválidas!");
    return;
  }

  // Upload da imagem (se existir)
  let imagemUrl = "";
  if (imagemInput.files.length > 0) {
    imagemUrl = await uploadImage(imagemInput.files[0]);
    if (!imagemUrl) return; // Interrompe se falhar
  }

  // Salva no Firestore
  db.collection("locais").add({
    nome,
    lat,
    lng,
    resenha,
    imagem: imagemUrl,
    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Ordenação
  }).then(() => {
    alert("Local salvo com sucesso!");
    event.target.reset();
  }).catch((error) => {
    console.error("Erro ao salvar:", error);
    alert("Erro ao salvar local.");
  });
});

// Adiciona marcador no mapa (com InfoWindow)
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

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}

// Inicializa o mapa quando a API do Google é carregada
window.initMap = initMap;
