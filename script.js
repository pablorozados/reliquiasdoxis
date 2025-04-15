// Importa Firebase e Cloudinary
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configuração do Cloudinary
const cloudName = "SEU_CLOUD_NAME";
const uploadPreset = "preset_padrao";

// Inicializa o mapa
let map;

function initMap() {
  const centro = { lat: -30.0346, lng: -51.2177 }; // Exemplo: Porto Alegre
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: centro,
  });
}

// Função de Login com GitHub
document.getElementById("login-github").addEventListener("click", () => {
  const provider = new GithubAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Usuário autenticado:", result.user);
      document.getElementById("login-section").style.display = "none";
      document.getElementById("add-location-section").style.display = "block";
    })
    .catch((error) => {
      console.error("Erro no login:", error);
      document.getElementById("login-error").textContent = "Erro no login. Tente novamente.";
    });
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).then(() => {
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

// Adicionar evento ao formulário
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

  // Salvar no Firestore
  await addDoc(collection(db, "locais"), { nome, lat, lng, resenha, imagem: imagemUrl });

  // Adicionar marcador no mapa
  adicionarMarcador({ nome, lat, lng, resenha, imagem: imagemUrl });

  // Limpar formulário
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
