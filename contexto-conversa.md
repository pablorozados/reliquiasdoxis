# 📚 DOCUMENTAÇÃO COMPLETA - RELÍQUIAS DO XIS

## 🌟 VISÃO GERAL
Sistema de avaliação de estabelecimentos com:
- Autenticação segura via Firebase
- Integração com Google Maps API
- CRUD completo de resenhas
- Deploy automatizado no GitHub Pages

## 🏗 ESTRUTURA DE ARQUIVOS
reliquias-do-xis/
├── public/ # Arquivos deployados
│ ├── admin.html # Painel administrativo
│ ├── admin.js # Lógica do admin (Firebase + Maps)
│ ├── gerenciar.html # Gestão de resenhas
│ └── index.html # Página principal
├── .github/workflows/
│ └── deploy.yml # Pipeline de CI/CD
└── firestore.rules # Regras de segurança


3. Configurações Essenciais
3.1 Firebase (admin.js)
javascript
const firebaseConfig = {
  apiKey: "SUA_CHAVE_FIREBASE",          // Substituída no deploy  
  authDomain: "reliquias-do-xis.firebaseapp.com",
  projectId: "reliquias-do-xis",         // ID do seu projeto  
  storageBucket: "reliquias-do-xis.appspot.com",
  messagingSenderId: "936551505510",     // Fixo  
  appId: "1:936551505510:web:22de1482a8f8d9720257a7" // Fixo  
};
3.2 Google Maps (admin.js)
javascript
function loadMapsAPI() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?
    key=SUA_CHAVE_GMAPS&      // Substituir  
    libraries=places&         // API de lugares  
    callback=initAutocomplete& // Função de retorno  
    loading=async`;           // Carregamento não-bloqueante  
  document.head.appendChild(script);
}
🛠 4. Funcionalidades Detalhadas
4.1 Sistema de Login
Fluxo:

Usuário insere e-mail/senha

Firebase valida credenciais

Armazena token de acesso no navegador

Redireciona para o painel admin

**
