// [Mantém sua configuração do Firebase...]

function escapeHtml(unsafe) {
  return unsafe?.toString()?.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m])) || '';
}

function initMap() {
  try {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: -30.0346, lng: -51.2177 },
      zoom: 14
    });

    db.collection("locais").orderBy("timestamp", "desc").get().then((snapshot) => {
      snapshot.forEach(doc => {
        const local = doc.data();
        const marker = new google.maps.Marker({
          position: { lat: local.lat, lng: local.lng },
          map: map,
          title: escapeHtml(local.nome)
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <h3>${escapeHtml(local.nome)}</h3>
            <p>${escapeHtml(local.resenha)}</p>
            ${local.imagem ? `<img src="${escapeHtml(local.imagem)}" loading="lazy">` : ''}
          `
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
      });
    });
  } catch (error) {
    console.error("Erro no mapa:", error);
    document.getElementById("map").innerHTML = `
      <div class="error">
        <p>Mapa indisponível. Recarregue a página.</p>
      </div>
    `;
  }
}
window.initMap = initMap;
