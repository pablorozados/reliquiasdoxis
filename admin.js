// ... (mantenha todo o código existente ANTES desta linha) ...

// =============================================
// FUNÇÃO PARA DELETAR RESENHAS (ADICIONE ISSO NO FINAL DO ARQUIVO)
// =============================================

// 1. Primeiro, adicione este HTML no seu admin.html (antes do </form>):
// <button type="button" id="delete-btn" class="delete-btn">🗑️ Apagar Última Resenha</button>

// 2. Depois adicione este CSS no style.css:
// .delete-btn {
//   background: #ff4444 !important;
//   margin-top: 20px;
// }
// .delete-btn:hover {
//   background: #cc0000 !important;
// }

// 3. Função para deletar a última resenha
document.getElementById('delete-btn')?.addEventListener('click', async () => {
  if (!confirm('ATENÇÃO: Isso apagará permanentemente a última resenha adicionada. Continuar?')) return;
  
  const deleteBtn = document.getElementById('delete-btn');
  deleteBtn.disabled = true;
  deleteBtn.textContent = "Apagando...";

  try {
    // Busca a última resenha (ordenando por timestamp)
    const snapshot = await firebase.firestore().collection('locais')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert('Nenhuma resenha encontrada para apagar!');
      return;
    }

    // Deleta o documento
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

// 4. [OPCIONAL] Função para listar todas as resenhas (útil para debug)
async function listAllReviews() {
  const snapshot = await firebase.firestore().collection('locais').get();
  snapshot.forEach(doc => {
    console.log("ID:", doc.id, "| Data:", doc.data().timestamp?.toDate(), "| Nome:", doc.data().nome);
  });
}
// Descomente para usar:
// listAllReviews();
