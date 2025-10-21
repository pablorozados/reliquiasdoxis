// admin.js

// Configura Firebase (usando a chave do secrets.js)
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "reliquiasdoxis.firebaseapp.com",
  projectId: "reliquiasdoxis",
  storageBucket: "reliquiasdoxis.appspot.com",
  messagingSenderId: "673027539850",
  appId: "1:673027539850:web:c8c5fa9e5dbff158cf92ed"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const publicarBtn = document.getElementById("publicar");
const resenhaInput = document.getElementById("resenha");
let imagemUrl = [];
let selectedNota = 0;
let selectedSujeira = 0;
let selectedCagada = 0;
let map;
let marker;
let autocomplete;

// Inicializa o mapa do Google
function initMap() {
  // Inicializa o mapa centralizado em Porto Alegre
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -30.0346, lng: -51.2177 },
    zoom: 13
  });

  // Inicializa o autocomplete
  const input = document.getElementById('locationField');
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    return;
  }

  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');

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
  document.getElementById('upload-btn').addEventListener('click', () => {
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

  // Publicar resenha
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
      await addDoc(collection(db, "locais"), {
        nome: nome,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        resenha: resenha,
        nota: selectedNota,
        sujeira: selectedSujeira,
        cagada: selectedCagada,
        imagem: imagemUrl[0] || null,
        autor: user.email,
        timestamp: serverTimestamp()
      });

      alert('Local adicionado com sucesso!');
      
      // Limpa o formulário
      resenhaInput.value = '';
      document.getElementById('locationField').value = '';
      document.getElementById('latitude').value = '';
      document.getElementById('longitude').value = '';
      document.getElementById('nome').value = '';
      document.getElementById('preview').src = '';
      document.getElementById('image-preview').classList.add('hidden');
      imagemUrl = [];
      
      // Remove seleção dos ratings
      ['nota-rating', 'sujeira-rating', 'cagada-rating'].forEach(id => {
        const options = document.getElementById(id).getElementsByClassName('rating-option');
        Array.from(options).forEach(opt => opt.classList.remove('selected'));
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
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    document.getElementById('login-error').textContent = "E-mail ou senha incorretos";
  }
});

document.getElementById('logout').addEventListener('click', () => {
  auth.signOut();
});



