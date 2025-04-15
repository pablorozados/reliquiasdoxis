// Dados de locais e resenhas
const locais = [
  {
    nome: "Xis do João",
    lat: -30.0346,
    lng: -51.2177,
    resenha: "O xis é incrível, muito recheado! Atendimento excelente.",
  },
  {
    nome: "Xis da Maria",
    lat: -30.0350,
    lng: -51.2250,
    resenha: "Ótimo custo-benefício, mas o pão veio um pouco queimado.",
  },
  {
    nome: "Xis do Zé",
    lat: -30.0330,
    lng: -51.2100,
    resenha: "Experiência mediana, mas o molho especial salva o lanche.",
  },
];

function initMap() {
  // Centraliza o mapa
  const centro = { lat: -30.0346, lng: -51.2177 }; // Exemplo: Porto Alegre
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: centro,
  });

  // Adiciona marcadores para cada local
  locais.forEach((local) => {
    const marker = new google.maps.Marker({
      position: { lat: local.lat, lng: local.lng },
      map: map,
      title: local.nome,
    });

    // InfoWindow para exibir a resenha
    const infoWindow = new google.maps.InfoWindow({
      content: `<h2>${local.nome}</h2><p>${local.resenha}</p>`,
    });

    // Exibir InfoWindow ao clicar no marcador
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}
