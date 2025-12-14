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
let autocomplete;

// Inicializa o mapa do Google
function initMap() {
  // Aguarda o DOM estar pronto
  if (!document.getElementById('map')) {
    console.error('Elemento map não encontrado');
    return;
  }
  
  // Inicializa o mapa centralizado em Porto Alegre
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -30.0346, lng: -51.2177 },
    zoom: 13
  });

  // Inicializa o autocomplete
  const input = document.getElementById('locationField');
  if (!input) {
    console.error('Elemento locationField não encontrado');
    return;
  }
  
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  // Cria um marcador inicial (invisível)
  marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  // Listener para quando um lugar é selecionado
  autocomplete.addListener('place_changed', () => {
    marker.setVisible(false);
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      window.alert("Nenhum detalhe disponível para: '" + place.name + "'");
      return;
    }

    // Se o lugar tem uma geometria, então apresentá-lo no mapa
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    // Atualiza os campos de latitude e longitude
    document.getElementById('latitude').value = place.geometry.location.lat();
    document.getElementById('longitude').value = place.geometry.location.lng();
    document.getElementById('nome').value = place.name;
  });
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

// Event listeners do formulário de login - usar DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  publicarBtn = document.getElementById("publicar");
  resenhaInput = document.getElementById("resenha");

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



