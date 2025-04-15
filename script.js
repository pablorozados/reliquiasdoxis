// Configurações do Cloudinary
const cloudName = "SEU_CLOUD_NAME"; // Substitua pelo seu Cloud Name
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

// Inicializa o mapa do Google Maps
function initMap() {
  const centro = { lat: -30.0346, lng: -51.2177 }; // Exemplo: Porto Alegre
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: centro,
  });
}

// Função para autenticação com e-mail e senha
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Usuário autenticado:", userCredential.user);
      document.getElementById("login-section").style.display = "none";
      document.getElementById("add-location-section").style.display = "block";
    })
    .catch((error) => {
      console.error("Erro no login:", error);
      document.getElementById("login-error").textContent = "Erro no login. Verifique e-mail e senha.";
    });
});

// Função para logout
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut().then(() => {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("add-location-section").style.display = "none";
  });
});

// Função para fazer upload de imagens no Cloudinary
async function uploadImage(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Imagem enviada:", data);
      return data.secure_url; // URL da imagem hospedada
    } else {
      console.error("Erro ao enviar imagem:", response.statusText);
    }
  } catch (error) {
    console.error("Erro de rede:", error);
  }
}

// Adicionar evento ao formulário de resenhas
document.getElementById("add-location-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);
  const resenha = document.getElementById("resenha").value;
  const imagemInput = document.getElementById("imagem");
  let imagemUrl = "";

  if (imagemInput.files.length > 0) {
    const imagemFile = imagemInput.files[0];
    imagemUrl = await uploadImage(imagemFile); // Faz o upload da imagem
  }

  // Salvar os dados no Firestore
  db.collection("locais").add({
    nome,
    lat,
    lng,
    resenha,
    imagem: imagemUrl,
  }).then((docRef) => {
    console.log("Local adicionado com ID:", docRef.id);
    adicionarMarcador({ nome, lat, lng, resenha, imagem: imagemUrl });
  }).catch((error) => {
    console.error("Erro ao salvar local:", error);
  });

  // Limpar o formulário
  event.target.reset();
});

// Adicionar marcador no mapa
function adicionarMarcador(local) {
  const marker = new google.maps.Marker({
    position: { lat: local.lat, lng: local.lng },
    map: map,
    title: local.nome,
  });

  const infoWindowContent = `
    <h2>${local.nome}</h2>
    <p>${local.resenha}</p>
    ${local.imagem ? `<img src="${local.imagem}" alt="${local.nome}" style="max-width: 100px;">` : ""}
  `;

  const infoWindow = new google.maps.InfoWindow({
    content: infoWindowContent,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}
