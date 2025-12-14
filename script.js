// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA7_SFUPE6n9KG6LhL9Y6DRanSW5Zn0-2k",
  projectId: "reliquias-do-xis"
};

// Inicializa Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
let map;
let markers = []; // array global de marcadores (para filtro)

// Função para gerar estrelas
function renderStars(num) {
  const count = parseInt(num) || 0;
  if (count === 0) return '☆☆☆☆☆'; // 5 estrelas vazias se for 0
  const stars = Array(count).fill('⭐').join('');
  const empty = Array(5 - count).fill('☆').join('');
  return stars + empty;
}

// Cria marcador com emojis por nota
function createMarkerIcon(nota) {
  const emojiMap = {
    5: '🥇', // Ouro
    4: '🥈', // Prata
    3: '🥉', // Bronze
    2: '🍔', // Hamburguer
    1: '💩'  // Cocô
  };
  const emoji = emojiMap[nota] || '🍔';
  const svg = `
    <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <!-- Fundo com sombra -->
      <circle cx="20" cy="18" r="16" fill="white" stroke="#333" stroke-width="2" opacity="0.95"/>
      <!-- Emoji do marcador -->
      <text x="20" y="25" text-anchor="middle" font-size="24">${emoji}</text>
    </svg>
  `;
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

// Inicializa o mapa com tratamento de erros
function initMap() {
  try {
    // Estilos do mapa para remover POI comerciais inúteis
    const mapStyles = [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.attraction',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.sports_complex',
        stylers: [{ visibility: 'off' }]
      },
      // Manter parques, igrejas, hospitais visíveis
      {
        featureType: 'poi.park',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'poi.place_of_worship',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'poi.medical',
        stylers: [{ visibility: 'on' }]
      }
    ];

    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: -30.0346, lng: -51.2177 },
      zoom: 14,
      styles: mapStyles
    });

    // Carrega marcadores existentes
    db.collection("locais").orderBy("timestamp", "desc").get().then((snapshot) => {
      snapshot.forEach(doc => {
        const local = doc.data();
        
        // Verifica se tem coordenadas válidas
        if (!local.latitude || !local.longitude) return;
        
        // DEBUG: Log pra ver a estrutura
        console.log('Local:', local.nome, 'Imagem:', local.imagem, 'Tipo:', Array.isArray(local.imagem) ? 'ARRAY' : typeof local.imagem);
        
        // Obtém a primeira imagem (pode ser string ou array)
        let imagemUrl = null;
        if (local.imagem) {
          if (Array.isArray(local.imagem)) {
            imagemUrl = local.imagem;
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
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50)
          }
        });
        
        // guarda referência para filtrar depois
        markers.push({ marker, nota: local.nota });

        // Cria HTML enriquecido com todos os ratings, pedido e galeria de fotos
        let galeryHtml = '';
        
        if (Array.isArray(imagemUrl) && imagemUrl.length > 0) {
          console.log('Montando galeria com', imagemUrl.length, 'fotos');
          galeryHtml = `
            <div style="margin-top: 12px; border-top: 1px solid #eee; padding-top: 10px;">
              <p style="font-size: 12px; font-weight: 600; color: #666; margin: 0 0 8px 0;">Fotos (${imagemUrl.length}):</p>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${imagemUrl.map((img, idx) => {
                  console.log('Foto', idx + 1, ':', img);
                  return `
                    <img src="${img}" 
                         alt="Foto ${idx + 1}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid #eee;" 
                         onclick="openLightbox('${img}')"
                         crossorigin="anonymous" 
                         referrerpolicy="no-referrer" 
                         onerror="console.warn('Imagem não carregou:', '${img}'); this.style.display='none';">
                  `;
                }).join('')}
              </div>
            </div>
          `;
        } else if (imagemUrl && typeof imagemUrl === 'string') {
          console.log('Montando foto única');
          galeryHtml = `
            <div style="margin-top: 12px; border-top: 1px solid #eee; padding-top: 10px;">
              <img src="${imagemUrl}" 
                   alt="${local.nome}" 
                   style="width: 100%; height: auto; border-radius: 4px; cursor: pointer;" 
                   onclick="openLightbox('${imagemUrl}')"
                   crossorigin="anonymous" 
                   referrerpolicy="no-referrer" 
                   onerror="console.warn('Imagem não carregou:', '${imagemUrl}'); this.style.display='none';">
            </div>
          `;
        } else {
          console.log('Nenhuma imagem encontrada');
        }

        const infoWindowContent = `
          <div style="font-family: 'Poppins', sans-serif; max-width: 320px; padding: 10px;">
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px;">${local.nome}</h3>
            
            <!-- Ratings com tooltips -->
            <div style="margin-bottom: 12px; line-height: 1.6; font-size: 13px;">
              <div style="margin-bottom: 8px;">
                <strong style="color: #FFD700;">Nota:</strong> ${renderStars(local.nota || 0)}
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #FF6B6B;">Me caguei comendo?</strong> 
                <span style="cursor: help; font-weight: bold;" title="O quanto me sujei comendo esse xis">ⓘ</span>
                ${renderStars(local.sujeira_comendo || 0)}
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #8B4513;">Me caguei depois?</strong> 
                <span style="cursor: help; font-weight: bold;" title="Autoexplicativo">ⓘ</span>
                ${renderStars(local.cagada_depois || 0)}
              </div>
              ${local.meu_pedido ? `
                <div style="margin-top: 10px; padding: 8px; background: #f9f9f9; border-left: 3px solid #FF6B6B; border-radius: 2px;">
                  <strong style="color: #555;">Pedido:</strong><br>
                  <span style="font-style: italic; color: #666;">${local.meu_pedido}</span>
                </div>
              ` : ''}
            </div>

            <p style="margin: 10px 0; font-size: 13px; line-height: 1.4; color: #555;">${local.resenha}</p>
            
            ${galeryHtml}
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

// Função global para abrir lightbox
window.openLightbox = function(imgSrc) {
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = `
      display: none;
      position: fixed;
      z-index: 2000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      cursor: pointer;
    `;
    lightbox.onclick = function() { this.style.display = 'none'; };
    lightbox.innerHTML = '<img id="lightbox-img" style="max-width: 90%; max-height: 90%; margin: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 8px;" />';
    document.body.appendChild(lightbox);
  }
  document.getElementById('lightbox-img').src = imgSrc;
  lightbox.style.display = 'block';
};

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




