<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - Xis POA</title>
  <link rel="stylesheet" href="style.css">
  
  <!-- Firebase -->
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore-compat.js"></script>

  <style>
    :root {
      --primary-color: #ff6b6b;
      --error-color: #f44336;
      --success-color: #4caf50;
      --delete-color: #ff4444;
    }
    
    body {
      font-family: 'Roboto', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    
    #login-section, #admin-panel {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    h2 {
      color: #333;
      text-align: center;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    input, textarea, button {
      width: 100%;
      padding: 12px;
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    button {
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    button:hover {
      background: #e05555;
    }

    #delete-btn {
      background: var(--delete-color) !important;
      margin-top: 20px;
    }
    
    #delete-btn:hover {
      background: #cc0000 !important;
    }
    
    #login-error {
      color: var(--error-color);
      text-align: center;
      margin-top: 1rem;
    }
    
    .grid-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .action-buttons button {
      flex: 1;
    }

    .pac-container {
      z-index: 10000 !important;
    }
  </style>
</head>
<body>
  <div id="login-section">
    <h2>Área do Dono</h2>
    <form id="login-form">
      <label for="email">E-mail:</label>
      <input type="email" id="email" required>
      
      <label for="password">Senha:</label>
      <input type="password" id="password" required>
      
      <button type="submit">Entrar</button>
      <p id="login-error"></p>
    </form>
  </div>

  <div id="admin-panel" style="display: none;">
    <h2>Adicionar Novo Xis</h2>
    <form id="add-location-form">
      <label for="endereco">Buscar local:</label>
      <input type="text" id="endereco" placeholder="Digite o endereço">
      
      <label for="nome">Nome do lugar:</label>
      <input type="text" id="nome" required>
      
      <div class="grid-columns">
        <div>
          <label for="latitude">Latitude:</label>
          <input type="text" id="latitude" readonly>
        </div>
        <div>
          <label for="longitude">Longitude:</label>
          <input type="text" id="longitude" readonly>
        </div>
      </div>
      
      <label for="resenha">Resenha:</label>
      <textarea id="resenha" rows="5" required></textarea>
      
      <label for="imagem">Imagem (opcional):</label>
      <input type="file" id="imagem">
      
      <button type="submit">Publicar</button>
    </form>

    <div class="action-buttons">
      <button id="delete-btn">🗑️ Apagar Última Resenha</button>
      <button id="logout">Sair</button>
    </div>
  </div>

  <!-- Script do Google Maps -->
  <script>
    function loadMapsAPI() {
      if (window.google && window.google.maps) return;
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAPS_API_KEY&libraries=places&callback=initAutocomplete`;
      script.async = true;
      document.head.appendChild(script);
    }
  </script>

  <script src="admin.js"></script>
</body>
</html>
