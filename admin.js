// admin.js

// Firebase já foi inicializado no HTML
const db = firebase.firestore();
const auth = firebase.auth();

let publicarBtn;
let resenhaInput;
let imagemUrl = [];
let selectedNota = 0;
let selectedSujeira = 0;
let selectedCagada = 0;
let map;
let marker;
let placePicker;
let currentPlace;

// Inicializa o mapa do Google (com novo PlaceAutocompleteElement)
function initMap() {
  // Aguarda o Google Maps estar carregado
  if (!window.google || !window.google.maps) {
    console.log('Google Maps API ainda não está carregada, aguardando...');
    setTimeout(initMap, 200);
    return;
  }
  
  console.log('✅ Inicializando mapa do admin com Google Maps carregado');
  
  try {
    // Obtém o elemento do mapa
    const mapElement = document.querySelector('gmp-map');
    if (!mapElement) {
      console.error('Elemento gmp-map não encontrado');
      setTimeout(initMap, 100);
      return;
    }
    
    // Obtém o place picker e o input
    const placePickerElement = document.querySelector('gmp-place-picker');
    const placePickerInput = document.getElementById('placePickerInput');
    
    if (!placePickerElement) {
      console.error('Elemento gmp-place-picker não encontrado');
      return;
    }
    
    if (!placePickerInput) {
      console.error('Elemento placePickerInput não encontrado');
      return;
    }
    
    // Vincula o input ao place picker para autocomplete
    placePickerElement.addEventListener('gmp-place-picker-request', (e) => {
      console.log('Place picker request:', e);
    });
    
    // Aguarda o mapa estar inicializado
    mapElement.addEventListener('gmp-map-loaded', () => {
      console.log('✅ Mapa gmp-map carregado!');
      map = mapElement.getMap();
      
      // Cria um marcador que será atualizado quando um lugar for selecionado
      marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
      });
      marker.setVisible(false);
    });
    
    // Listener para quando um lugar é selecionado no Place Picker
    placePickerElement.addEventListener('gmp-place-picker-place-changed', async (e) => {
      console.log('Place changed detectado via PlaceAutocompleteElement');
      
      if (!placePickerElement.place) {
        console.warn('⚠️ Nenhum lugar selecionado');
        return;
      }
      
      const place = placePickerElement.place;
      console.log('📍 Lugar selecionado:', place);
      
      // Extrai informações do lugar
      const placeId = place.id;
      const displayName = place.displayName;
      
      // Usa o Places API para obter geometry (se necessário)
      const { PlacesService } = google.maps.places;
      const service = new PlacesService(map);
      
      service.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'name', 'formatted_address']
        },
        (placeDetails, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.error('Erro ao obter detalhes do lugar:', status);
            return;
          }
          
          console.log('📍 Detalhes do lugar:', placeDetails);
          
          if (!placeDetails.geometry) {
            console.warn('⚠️ Lugar sem geometria (sem coordenadas)');
            return;
          }
          
          currentPlace = placeDetails;
          
          // Atualiza o mapa
          if (placeDetails.geometry.viewport) {
            map.fitBounds(placeDetails.geometry.viewport);
          } else if (placeDetails.geometry.location) {
            map.setCenter(placeDetails.geometry.location);
            map.setZoom(17);
          }
          
          // Atualiza o marcador
          if (marker) {
            marker.setPosition(placeDetails.geometry.location);
            marker.setVisible(true);
          }
          
          // Atualiza os campos do formulário
          document.getElementById('latitude').value = placeDetails.geometry.location.lat();
          document.getElementById('longitude').value = placeDetails.geometry.location.lng();
          document.getElementById('nome').value = placeDetails.name || displayName;
          placePickerInput.value = placeDetails.name || displayName;
          
          console.log('✅ Local selecionado:', placeDetails.name);
        }
      );
    });
    
    console.log('✅ Mapa inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar mapa:', error);
  }
}

// Função para configurar os ratings
function setupRating(containerId, callback) {
  const container = document.getElementById(containerId);
  const options = container.getElementsByClassName('rating-option');
  
  Array.from(options).forEach(option => {
    option.addEventListener('click', () => {
      // Remove seleção anterior
      Array.from(options).forEach(opt => opt.classList.remove('selected'));
      // Adiciona seleção ao clicado
      option.classList.add('selected');
      // Chama callback com valor
      callback(parseInt(option.dataset.value));
    });
  });
}

// Listener de autenticação - executa assim que o Firebase está pronto
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    const loginSection = document.getElementById('login-section');
    const adminPanel = document.getElementById('admin-panel');
    if (loginSection) loginSection.classList.remove('hidden');
    if (adminPanel) adminPanel.classList.add('hidden');
    return;
  }

  const loginSection = document.getElementById('login-section');
  const adminPanel = document.getElementById('admin-panel');
  if (loginSection) loginSection.classList.add('hidden');
  if (adminPanel) adminPanel.classList.remove('hidden');

  // Inicializa os ratings
  setupRating('nota-rating', value => selectedNota = value);
  setupRating('sujeira-rating', value => selectedSujeira = value);
  setupRating('cagada-rating', value => selectedCagada = value);

  // Configuração do Cloudinary
  const cloudinaryConfig = {
    cloudName: 'dgdjaz541',
    uploadPreset: 'reliquias_do_xis'
  };

  // Upload de imagem
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      window.cloudinary.createUploadWidget(cloudinaryConfig, 
        (error, result) => {
          if (result?.event === "success") {
            if (!Array.isArray(imagemUrl)) {
              imagemUrl = [];
            }
            imagemUrl.push(result.info.secure_url);
            document.getElementById('preview').src = result.info.secure_url;
            document.getElementById('image-preview').classList.remove('hidden');
          }
        }
      ).open();
    });
  }

  // Publicar resenha
  if (publicarBtn) {
    publicarBtn.addEventListener('click', async () => {
      const latitude = document.getElementById('latitude').value;
      const longitude = document.getElementById('longitude').value;
      const nome = document.getElementById('nome').value;
      const resenha = resenhaInput.value.trim();

      if (!latitude || !longitude || !nome || !resenha || !selectedNota || !selectedSujeira || !selectedCagada) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      try {
        const { addDoc, collection, serverTimestamp } = firebase.firestore;
        await firebase.firestore().collection("locais").add({
          nome: nome,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          resenha: resenha,
          nota: selectedNota,
          sujeira_comendo: selectedSujeira,
          cagada_depois: selectedCagada,
          imagem: imagemUrl,
          meu_pedido: document.getElementById('pedido')?.value || '',
          autor: user.email,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Local adicionado com sucesso!');
        
        // Limpa o formulário
        if (resenhaInput) resenhaInput.value = '';
        const locationField = document.getElementById('locationField');
        if (locationField) locationField.value = '';
        const latitudeField = document.getElementById('latitude');
        if (latitudeField) latitudeField.value = '';
        const longitudeField = document.getElementById('longitude');
        if (longitudeField) longitudeField.value = '';
        const nomeField = document.getElementById('nome');
        if (nomeField) nomeField.value = '';
        const preview = document.getElementById('preview');
        if (preview) preview.src = '';
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) imagePreview.classList.add('hidden');
        imagemUrl = [];
        
        // Remove seleção dos ratings
        ['nota-rating', 'sujeira-rating', 'cagada-rating'].forEach(id => {
          const container = document.getElementById(id);
          if (container) {
            const options = container.getElementsByClassName('rating-option');
            Array.from(options).forEach(opt => opt.classList.remove('selected'));
          }
        });
        
        selectedNota = 0;
        selectedSujeira = 0;
        selectedCagada = 0;
        
        // Remove o marcador do mapa
        if (marker) {
          marker.setVisible(false);
        }
        
      } catch (error) {
        console.error("Erro ao salvar local:", error);
        alert("Erro ao salvar. Veja o console para mais detalhes.");
      }
    });
  }
});

// Event listeners do formulário de login e inicialização
document.addEventListener('DOMContentLoaded', function() {
  publicarBtn = document.getElementById("publicar");
  resenhaInput = document.getElementById("resenha");

  // Aguarda o script do Google Maps Web Components estar pronto
  if (!window.google) {
    console.log('Aguardando Google Maps carregar...');
    setTimeout(() => {
      if (typeof initMap === 'function') {
        initMap();
      }
    }, 500);
  } else {
    // Google Maps já está carregado
    if (typeof initMap === 'function') {
      initMap();
    }
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      console.log('Tentando login com:', email);
      
      try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('Login bem-sucedido!');
      } catch (error) {
        console.error('Erro no login:', error.code, error.message);
        const loginError = document.getElementById('login-error');
        if (loginError) {
          loginError.textContent = "E-mail ou senha incorretos. Erro: " + error.message;
        }
      }
    });
  }

  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut();
    });
  }
});



