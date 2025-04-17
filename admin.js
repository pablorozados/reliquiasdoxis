// [Configuração do Firebase e inicialização mantida igual]

// ========== NOVAS FUNÇÕES ========== //

// Carrega e exibe todas as resenhas
async function loadAllReviews() {
  const resenhasList = document.getElementById('resenhas-list');
  resenhasList.innerHTML = '<p>Carregando suas resenhas...</p>';

  try {
    const snapshot = await db.collection("locais")
      .where("userId", "==", auth.currentUser.uid)
      .orderBy("timestamp", "desc")
      .get();

    if (snapshot.empty) {
      resenhasList.innerHTML = '<p>Nenhuma resenha encontrada.</p>';
      return;
    }

    resenhasList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const resenhaItem = document.createElement('div');
      resenhaItem.className = 'resenha-item';
      resenhaItem.innerHTML = `
        <h3>${data.nome}</h3>
        <p><strong>Data:</strong> ${data.timestamp?.toDate().toLocaleDateString()}</p>
        <p><strong>Resenha:</strong> ${data.resenha}</p>
        ${data.imagem ? `<img src="${data.imagem}" alt="${data.nome}" style="max-width: 200px;">` : ''}
        <div class="resenha-actions">
          <button class="delete-btn" data-id="${doc.id}">🗑️ Deletar</button>
        </div>
      `;
      resenhasList.appendChild(resenhaItem);
    });

    // Adiciona eventos aos botões de deletar
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const resenhaId = e.target.getAttribute('data-id');
        deleteReview(resenhaId);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar resenhas:", error);
    resenhasList.innerHTML = `<p class="error">Erro ao carregar resenhas: ${error.message}</p>`;
  }
}

// Deleta uma resenha específica
async function deleteReview(resenhaId) {
  if (!confirm('ATENÇÃO: Isso apagará permanentemente esta resenha. Continuar?')) return;

  try {
    await db.collection("locais").doc(resenhaId).delete();
    alert('Resenha apagada com sucesso!');
    loadAllReviews(); // Recarrega a lista
  } catch (error) {
    console.error("Erro ao apagar:", error);
    alert(`Erro: ${error.message}`);
  }
}

// ========== ATUALIZAÇÕES NO CÓDIGO EXISTENTE ========== //

// Modifique o listener de autenticação para carregar as resenhas
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário autenticado:", user.email);
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    loadMapsAPI().catch(console.error);
    loadAllReviews(); // Carrega as resenhas ao logar
  } else {
    console.log("Usuário não autenticado");
    loginSection.style.display = "block";
    adminPanel.style.display = "none";
  }
});

// [Restante do código mantido igual]
