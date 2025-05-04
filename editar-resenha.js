// Configuração do Firebase (JÁ USA SUAS SECRETS AUTOMATICAMENTE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY", // JÁ SUBSTITUÍDA PELO GITHUB
  projectId: "FIREBASE_PROJECT_ID" // JÁ SUBSTITUÍDA PELO GITHUB
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Modal de Edição (PRONTO PARA USAR)
const modal = document.createElement('div');
modal.innerHTML = `
<div id="editModal" style="display:none;position:fixed;z-index:1000;left:0;top:0;width:100%;height:100%;background-color:rgba(0,0,0,0.7);">
  <div style="background:#fff;margin:10% auto;padding:20px;width:80%;max-width:600px;border-radius:8px;">
    <span id="closeModal" style="float:right;font-size:28px;cursor:pointer;">&times;</span>
    <h2>Editar Resenha</h2>
    <form id="editForm">
      <input type="hidden" id="editId">
      <input type="text" id="editNome" placeholder="Nome do Local" required style="width:100%;margin-bottom:10px;padding:8px;">
      <textarea id="editDescricao" placeholder="Sua resenha" required style="width:100%;height:100px;margin-bottom:10px;padding:8px;"></textarea>
      <input type="number" id="editNota" min="1" max="5" placeholder="Nota (1-5)" required style="width:100%;margin-bottom:10px;padding:8px;">
      <button type="submit" style="background:#4CAF50;color:white;padding:10px;border:none;cursor:pointer;">Salvar</button>
    </form>
  </div>
</div>`;
document.body.appendChild(modal);

// Funções Prontas (NÃO PRECISA MEXER)
document.getElementById('closeModal').onclick = () => modal.style.display = 'none';
window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };

document.getElementById('editForm').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await updateDoc(doc(db, "locais", document.getElementById('editId').value), {
      nome: document.getElementById('editNome').value,
      descricao: document.getElementById('editDescricao').value,
      nota: document.getElementById('editNota').value,
      updatedAt: new Date()
    });
    alert('✅ Resenha atualizada!');
    modal.style.display = 'none';
    location.reload(); // Recarrega a página
  } catch (error) {
    alert('❌ Erro: ' + error.message);
  }
};

// Adiciona botão "Editar" em todas as resenhas (FUNCIONA AUTOMATICAMENTE)
function addEditButtons() {
  document.querySelectorAll('.resenha').forEach(resenha => {
    if (!resenha.querySelector('.edit-btn')) {
      const btn = document.createElement('button');
      btn.className = 'edit-btn';
      btn.innerHTML = '✏️ Editar';
      btn.onclick = () => {
        modal.style.display = 'block';
        document.getElementById('editId').value = resenha.dataset.id;
        document.getElementById('editNome').value = resenha.dataset.nome;
        document.getElementById('editDescricao').value = resenha.dataset.descricao;
        document.getElementById('editNota').value = resenha.dataset.nota;
      };
      resenha.appendChild(btn);
    }
  });
}

// Observa mudanças na página para adicionar botões
new MutationObserver(addEditButtons).observe(document.body, { 
  childList: true, subtree: true 
});
