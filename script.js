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
const db = firebase.firestore();
let map;

// Inicializa o mapa com tratamento de erros
function initMap() {
  try {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: -30.0346, lng: -51.2177 },
      zoom: 14
    });

    // Carrega marcadores existentes
    db.collection("locais").orderBy("timestamp", "desc").get().then((snapshot) => {
      snapshot.forEach(doc => {
        const local = doc.data();
        const marker = new google.maps.Marker({
          position: { lat: local.lat, lng: local.lng },
          map: map,
          title: local.nome
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <h3>${local.nome}</h3>
            <p>${local.resenha}</p>
            ${local.imagem ? `<img src="${local.imagem}" alt="${local.nome}" style="max-width: 200px;">` : ""}
          `
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
      });
    });

  } catch (error) {
    console.error("Erro ao carregar o mapa:", error);
    document.getElementById("map").innerHTML = `
      <p style="color: red; text-align: center; padding: 20px;">
        O mapa não pôde ser carregado. Verifique sua conexão ou recarregue a página.
      </p>
    `;
  }
}

// Garante que 'initMap' seja global
window.initMap = initMap;
