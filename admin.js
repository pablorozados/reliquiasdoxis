// Configuração do Firebase
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY", // SERÁ SUBSTITUÍDO NO DEPLOY
  authDomain: "reliquias-do-xis.firebaseapp.com",
  projectId: "FIREBASE_PROJECT_ID", // SERÁ SUBSTITUÍDO NO DEPLOY
  storageBucket: "reliquias-do-xis.appspot.com",
  messagingSenderId: "936551505510",
  appId: "1:936551505510:web:22de1482a8f8d9720257a7"
};

// [Restante do código com todas as correções anteriores]
// ... (o código completo que te enviei anteriormente)

// Carregamento otimizado do Maps
function loadGoogleMapsAPI() {
  const callbackName = 'initMap_' + Date.now();
  window[callbackName] = () => {
    delete window[callbackName];
    initAutocomplete();
  };

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_KEY}&libraries=places&callback=${callbackName}`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    document.getElementById('endereco').placeholder = 'Serviço indisponível';
  };
  document.head.appendChild(script);
}
