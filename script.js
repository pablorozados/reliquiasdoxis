// Configuração do Firebase
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  projectId: "FIREBASE_PROJECT_ID"
};

// Inicializa Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
let map;
let markers = []; // array global de marcadores (para filtro)

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
        
        // Verifica se tem coordenadas válidas
        if (!local.latitude || !local.longitude) return;
        
        const marker = new google.maps.Marker({
          position: { lat: local.latitude, lng: local.longitude },
          map: map,
          title: local.nome
        });
        // guarda referência para filtrar depois
        markers.push({ marker, nota: local.nota });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <h3>${local.nome}</h3>
            <p>${local.resenha}</p>
            ${local.imagem ? `<img src="${local.imagem}" alt="${local.nome}" style="max-width: 200px;" crossorigin="anonymous" referrerpolicy="no-referrer" onerror="this.style.display='none';console.warn('Imagem falhou ao carregar:', this.src);">` : ""}
          `
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
      });
    }).catch(error => {
      console.error("Erro ao carregar locais:", error);
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

// Função para filtrar os marcadores por nota
function filterMarkers() {
  const selectedRating = document.getElementById("filter-rating").value;
  markers.forEach(({ marker, nota }) => {
    if (selectedRating === "all" || parseInt(selectedRating) === nota) {
      marker.setMap(map);
    } else {
      marker.setMap(null);
    }
  });
}

window.filterMarkers = filterMarkers;




