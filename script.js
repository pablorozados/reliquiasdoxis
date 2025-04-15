// Importa o Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Inicializa o mapa
let map;

function initMap() {
  const centro = { lat: -30.0346, lng: -51.2177 }; // Exemplo: Porto Alegre
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: centro,
  });

  // Carregar locais do Firestore
  getDocs(collection(db, "locais")).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const local = doc.data();
      adicionarMarcador(local);
    });
  });
}

// Adiciona um marcador ao mapa
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

// Login
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById("login-section").style.display = "none";
      document.getElementById("add-location-section").style.display = "block";
    })
    .catch((error) => {
      document.getElementById("login-error").textContent = error.message;
    });
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).then(() => {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("add-location-section").style.display = "none";
  });
});

// Adicionar Local
document.getElementById("add-location-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);
  const resenha = document.getElementById("resenha").value;
  const imagemInput = document.getElementById("imagem");
  let imagemUrl = "";

  // Upload da imagem para o Firebase Storage
  if (imagemInput.files.length > 0) {
    const imagemFile = imagemInput.files[0];
    const imagemRef = ref(storage, `imagens/${imagemFile.name}`);
    await uploadBytes(imagemRef, imagemFile);
    imagemUrl = await getDownloadURL(imagemRef);
  }

  // Salvar no Firestore
  await addDoc(collection(db, "locais"), { nome, lat, lng, resenha, imagem: imagemUrl });

  // Adicionar o marcador no mapa
  adicionarMarcador({ nome, lat, lng, resenha, imagem: imagemUrl });

  // Limpar o formulário
  event.target.reset();
});
