// Configuração do Firebase (substitua pelas suas credenciais)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicialização do Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Elementos da UI
const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout");

// Verificação de estado de autenticação
auth.onAuthStateChanged((user) => {
  console.group("Estado da Autenticação");
  if (user) {
    console.log("✅ Usuário autenticado:", user.email);
    console.log("🔑 UID:", user.uid);
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
  } else {
    console.log("🔒 Nenhum usuário autenticado");
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
  console.groupEnd();
});

// Sistema de Login Aprimorado
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const loginBtn = loginForm.querySelector("button[type='submit']");

  // Reset de estado
  loginBtn.disabled = true;
  loginBtn.textContent = "Autenticando...";
  loginError.textContent = "";
  loginError.style.display = "none";

  try {
    console.group("Tentativa de Login");
    console.log("📧 E-mail:", email);
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log("🎉 Login bem-sucedido!", userCredential.user);
    
    loginBtn.textContent = "✓ Acesso concedido!";
    loginBtn.style.backgroundColor = "#4CAF50";
    await new Promise(resolve => setTimeout(resolve, 1500));
    
  } catch (error) {
    console.error("❌ Falha na autenticação:", error);
    
    const errorInfo = parseAuthError(error);
    loginError.textContent = errorInfo.message;
    loginError.style.display = "block";
    loginError.style.color = "#f44336";
    
    console.log("🛠️ Código do erro:", errorInfo.code);
    console.log("💡 Solução sugerida:", errorInfo.solution);
    
    loginBtn.textContent = "Tentar novamente";
    loginBtn.style.backgroundColor = "";
  } finally {
    loginBtn.disabled = false;
    console.groupEnd();
  }
});

// Função para análise detalhada de erros
function parseAuthError(error) {
  const errorMap = {
    "auth/invalid-email": {
      code: "E-mail inválido",
      message: "❌ Formato de e-mail incorreto",
      solution: "Use um e-mail válido (ex: usuario@provedor.com)"
    },
    "auth/user-disabled": {
      code: "Conta desativada",
      message: "❌ Esta conta foi desativada",
      solution: "Contate o administrador do sistema"
    },
    "auth/user-not-found": {
      code: "Usuário não encontrado",
      message: "❌ E-mail não cadastrado",
      solution: "Verifique o e-mail ou crie uma conta"
    },
    "auth/wrong-password": {
      code: "Senha incorreta",
      message: "🔑 Senha não confere",
      solution: "Tente novamente ou redefina a senha"
    },
    "auth/too-many-requests": {
      code: "Muitas tentativas",
      message: "🔒 Acesso temporariamente bloqueado",
      solution: "Aguarde 15 minutos ou redefina a senha"
    },
    "auth/operation-not-allowed": {
      code: "Método desativado",
      message: "⚠️ Login por e-mail/senha não está habilitado",
      solution: "Ative 'E-mail/senha' no Firebase Console"
    }
  };

  return errorMap[error.code] || {
    code: error.code,
    message: `Erro técnico (${error.code})`,
    solution: "Verifique o console para detalhes"
  };
}

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("👋 Logout realizado com sucesso");
      window.location.href = "index.html";
    })
    .catch(error => {
      console.error("Erro no logout:", error);
    });
});

// [Seu código existente para Places API e outros...]
