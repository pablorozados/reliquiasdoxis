// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA7_SFUPE6n9KG6LhL9Y6DRanSW5Zn0-2k",
  authDomain: "reliquias-do-xis.firebaseapp.com",
  projectId: "reliquias-do-xis",
  storageBucket: "reliquias-do-xis.appspot.com",
  messagingSenderId: "936551505510",
  appId: "1:936551505510:web:22de1482a8f8d9720257a7"
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

// Controle de autenticação (SEM window.location.reload)
auth.onAuthStateChanged((user) => {
  if (user) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    initAutocomplete();
  } else {
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// Sistema de login (corrigido)
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginBtn = loginForm.querySelector("button[type='submit']");

  loginBtn.disabled = true;
  loginBtn.textContent = "Entrando...";
  loginError.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // Não usa window.location aqui!
  } catch (error) {
    loginError.textContent = getErrorMessage(error.code);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";
  }
});

// Logout (sem recarregar a página)
logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// Função para deletar resenha (original)
document.getElementById('delete-btn').addEventListener('click', async () => {
  if (!confirm('ATENÇÃO: Isso apagará permanentemente a última resenha adicionada. Continuar?')) return;
  
  const deleteBtn = document.getElementById('delete-btn');
  deleteBtn.disabled = true;
  deleteBtn.textContent = "Apagando...";

  try {
    const snapshot = await db.collection('locais')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert('Nenhuma resenha encontrada para apagar!');
      return;
    }

    await snapshot.docs[0].ref.delete();
    alert('Resenha apagada com sucesso!');
  } catch (error) {
    console.error("Erro ao apagar:", error);
    alert('Erro: ' + error.message);
  } finally {
    deleteBtn.disabled = false;
    deleteBtn.textContent = "🗑️ Apagar Última Resenha";
  }
});

// [Restante do seu código original...]
// ... (incluindo initAutocomplete, uploadImage, etc.)

function getErrorMessage(code) {
  const errors = {
    "auth/invalid-email": "E-mail inválido",
    "auth/user-not-found": "E-mail não cadastrado",
    "auth/wrong-password": "Senha incorreta",
    "auth/too-many-requests": "Muitas tentativas. Tente mais tarde."
  };
  return errors[code] || "Erro ao fazer login";
}

window.initAutocomplete = initAutocomplete;
