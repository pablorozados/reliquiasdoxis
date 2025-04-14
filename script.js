let map;

function initMap() {
  // Inicializa o mapa centrado em Porto Alegre, RS
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -30.0346, lng: -51.2177 },
    zoom: 12,
  });

  // Adiciona um evento de clique para criar marcadores
  map.addListener("click", (event) => {
    const latLng = event.latLng;
    const title = prompt("Digite o nome do local:");
    const description = prompt("Escreva sua resenha:");
    if (title && description) {
      addMarker(latLng, title, description);
    }
  });
}

// Adiciona um marcador no mapa
function addMarker(location, title, description) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    title: title,
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `<h3>${title}</h3><p>${description}</p>`,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}