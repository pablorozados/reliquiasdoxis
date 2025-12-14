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

// Cores dos marcadores por rating
const markerColors = {
  5: '#FFD700', // Ouro
  4: '#C0C0C0', // Prata
  3: '#CD7F32', // Bronze
  2: '#FF4444', // Vermelho
  1: '#8B4513'  // Marrom
};

// Cria marcador customizado com SVG
function createMarkerIcon(nota) {
  const color = markerColors[nota] || '#808080';
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="white">${nota}</text>
    </svg>
  `;
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

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
        
        // Obtém a primeira imagem (pode ser string ou array)
        let imagemUrl = null;
        if (local.imagem) {
          if (Array.isArray(local.imagem)) {
            imagemUrl = local.imagem[0];
          } else {
            imagemUrl = local.imagem;
          }
        }

        // Cria marcador customizado com cor baseada na nota
        const marker = new google.maps.Marker({
          position: { lat: local.latitude, lng: local.longitude },
          map: map,
          title: local.nome,
          icon: {
            url: createMarkerIcon(local.nota),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          }
        });
        
        // guarda referência para filtrar depois
        markers.push({ marker, nota: local.nota });

        // Cria HTML enriquecido com todos os ratings e imagem
        const infoWindowContent = `
          <div style="font-family: 'Poppins', sans-serif; max-width: 300px; padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${local.nome}</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; text-align: center; font-size: 12px;">
              <div>
                <strong style="color: #FFD700;">Nota</strong><br>
                ⭐ ${local.nota || '-'}/5
              </div>
              <div>
                <strong style="color: #FF6B6B;">Sujeira</strong><br>
                🍔 ${local.sujeira || '-'}/5
              </div>
              <div>
                <strong style="color: #8B4513;">Cagada</strong><br>
                💩 ${local.cagada || '-'}/5
              </div>
            </div>

            <p style="margin: 10px 0; font-size: 13px; line-height: 1.4; color: #555;">${local.resenha}</p>
            
            ${imagemUrl ? `
              <img src="${imagemUrl}" 
                   alt="${local.nome}" 
                   style="max-width: 100%; height: auto; border-radius: 4px; margin-top: 10px;" 
                   crossorigin="anonymous" 
                   referrerpolicy="no-referrer" 
                   onerror="this.style.display='none'; console.warn('Imagem falhou:', this.src);">
            ` : ''}
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent,
          maxWidth: 350
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




