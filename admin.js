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

// [Restante do seu código...]

// Função de deletar atualizada
document.getElementById('delete-btn').addEventListener('click', async () => {
  if (!auth.currentUser) {
    alert("Faça login antes de apagar");
    return;
  }

  if (!confirm('ATENÇÃO: Isso apagará permanentemente a última resenha adicionada. Continuar?')) return;
  
  const deleteBtn = document.getElementById('delete-btn');
  deleteBtn.disabled = true;
  deleteBtn.textContent = "Apagando...";

  try {
    const snapshot = await db.collection("locais")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert('Nenhuma resenha encontrada para apagar!');
      return;
    }

    // Adiciona verificação extra de permissão
    const docToDelete = snapshot.docs[0];
    await db.collection("locais").doc(docToDelete.id).delete();
    
    alert('Resenha apagada com sucesso!');
  } catch (error) {
    console.error("Erro ao apagar:", error);
    alert(`Erro: ${error.message}\n\nSe persistir, verifique as regras do Firestore.`);
  } finally {
    deleteBtn.disabled = false;
    deleteBtn.textContent = "🗑️ Apagar Última Resenha";
  }
});
