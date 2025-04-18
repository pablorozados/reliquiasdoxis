# RELATÓRIO DO PROJETO - RELÍQUIAS DO XIS  
**Última atualização**: {{DATA_ATUAL}}  

---

## ✅ **FUNCIONALIDADES OPERACIONAIS**  
1. **Autenticação**  
   - Login com e-mail/senha  
   - Transição login → painel admin  

2. **Firebase**  
   - Conexão estabelecida  
   - Leitura/escrita no Firestore  

3. **Estrutura Básica**  
   - HTML/CSS principal carregando  

---

## 🔴 **PROBLEMAS CONHECIDOS**  

| Problema               | Arquivo Afetado | Status       |
|------------------------|-----------------|--------------|
| Google Maps não carrega | admin.js        | Não resolvido|
| Campos do form ocultos  | admin.html      | Parcial      |
| Deploy inconsistentes   | deploy.yml      | Em análise   |

---

## 📁 **ESTADO DOS ARQUIVOS**  

### `admin.html` (PRECISA DE ATUALIZAÇÃO)  
```html
<!-- Adicionar dentro de #admin-panel -->
<div class="form-group">
  <label for="nome">Nome do lugar:</label>
  <input type="text" id="nome" required>
  
  <label for="resenha">Resenha:</label>
  <textarea id="resenha" required></textarea>
  
  <!-- Adicionar outros campos necessários -->
</div>
