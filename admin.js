// Substitua a função loadMapsAPI() no admin.js por esta versão atualizada:
function loadMapsAPI() {
  if (window.google && window.google.maps && window.google.maps.places?.PlaceAutocompleteElement) {
    initAutocomplete();
    return;
  }

  // Remove scripts anteriores para evitar duplicação
  const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  existingScripts.forEach(script => script.remove());

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAPS_API_KEY&libraries=places&loading=async&callback=initAutocomplete`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Atualize a função initAutocomplete() para usar o novo PlaceAutocompleteElement:
function initAutocomplete() {
  const input = document.getElementById("endereco");
  
  if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
    console.error("API do Google Maps não carregou corretamente ou versão incompatível");
    input.placeholder = "Recarregue a página para ativar a busca";
    return;
  }

  try {
    // Método moderno (recomendado)
    const autocomplete = new google.maps.places.PlaceAutocompleteElement({
      inputElement: input,
      componentRestrictions: { country: "br" }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place?.geometry?.location) {
        console.log("Local sem coordenadas:", place?.name);
        return;
      }

      document.getElementById("nome").value = place.name || "";
      document.getElementById("latitude").value = place.geometry.location.lat();
      document.getElementById("longitude").value = place.geometry.location.lng();
    });

  } catch (error) {
    console.error("Erro ao inicializar autocomplete:", error);
    // Fallback para método legado (se necessário)
    try {
      const legacyAutocomplete = new google.maps.places.Autocomplete(input, {
        types: ['establishment'],
        fields: ['name', 'geometry'],
        componentRestrictions: { country: "br" }
      });

      legacyAutocomplete.addListener("place_changed", () => {
        const place = legacyAutocomplete.getPlace();
        if (!place.geometry) {
          console.log("Local sem coordenadas (legado):", place.name);
          return;
        }

        document.getElementById("nome").value = place.name;
        document.getElementById("latitude").value = place.geometry.location.lat();
        document.getElementById("longitude").value = place.geometry.location.lng();
      });
    } catch (legacyError) {
      console.error("Falha no método legado também:", legacyError);
      input.placeholder = "Erro na busca. Recarregue a página.";
    }
  }
}
