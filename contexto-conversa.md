# 📚 Documentação Completa - Relíquias do Xis

## 🌟 Visão Geral
Sistema de avaliação de estabelecimentos com:
- Autenticação segura via Firebase
- Integração com Google Maps API
- Upload de imagens via Cloudinary
- CRUD de resenhas no Firestore
- Deploy automatizado no GitHub Pages

---

## 🛠️ Tecnologias Utilizadas
| Tecnologia       | Função                          | Versão |
|------------------|---------------------------------|--------|
| Firebase         | Autenticação e banco de dados   | v9.21.0|
| Google Maps API  | Busca de locais e mapas         | v3     |
| Cloudinary       | Upload e armazenamento de imagens| v1     |
| GitHub Actions   | CI/CD e deploy automático       | -      |

---

## 🔐 Configurações Sensíveis (Secrets)
### GitHub Secrets (`.github/workflows/deploy.yml`)
| Secret Name             | Descrição                     | Exemplo |
|-------------------------|-------------------------------|---------|
| `FIREBASE_API_KEY`      | Chave da API do Firebase      | AIza... |
| `FIREBASE_PROJECT_ID`   | ID do projeto Firebase        | reliquias-do-xis |
| `GOOGLE_MAPS_API_KEY`   | Chave da API do Google Maps   | AIza... |
| `CLOUDINARY_CLOUD_NAME` | Nome da nuvem no Cloudinary   | dgdjaz541 |

### Cloudinary
- **Upload Preset**: `reliquias_do_xis` (unsigned)
- **Restrições**:
  - Formatos: `jpg`, `png`, `jpeg`
  - Tamanho máximo: 5MB
  - Tags automáticas: `from_website`

---

## 📂 Estrutura de Arquivos
reliquiasdoxis/
├── public/
│ ├── admin.html # Painel administrativo
│ ├── admin.js # Lógica do admin (Firebase + Cloudinary)
│ ├── index.html # Página principal com mapa
│ └── style.css # Estilos globais
├── .github/
│ └── workflows/
│ └── deploy.yml # Pipeline de CI/CD
└── README.md


---

## ⚙️ Funcionalidades
### ✅ Funcionando Corretamente
1. **Autenticação**:
   - Login com e-mail/senha via Firebase
   - Controle de sessão
   - Logout seguro

2. **Google Maps**:
   - Busca de estabelecimentos
   - Autopreenchimento de endereço
   - Captura de coordenadas (lat/lng)

3. **Cloudinary**:
   - Upload de imagens (até 5MB)
   - Preview da imagem antes do envio
   - Validação de formato (jpg/png)

4. **Firestore**:
   - Cadastro de novas resenhas
   - Armazenamento de dados:
     ```javascript
     {
       nome: "Nome do lugar",
       latitude: -30.1234,
       longitude: -51.1234,
       resenha: "Texto da resenha",
       imagem: "URL da imagem (opcional)",
       timestamp: Data do servidor
     }
     ```

### ⚠️ Funcionalidades Parciais/Limitadas
1. **Exclusão de resenhas**:
   - Implementado apenas o botão (lógica não completa)
   
2. **Moderação de imagens**:
   - Cloudinary não está configurado para análise automática de conteúdo

### ❌ Não Implementado
1. Edição de resenhas existentes
2. Sistema de avaliação por estrelas
3. Filtros por categoria

---

## 🔄 Fluxo de Deploy
1. **Push para `main`**:
   - GitHub Actions executa `deploy.yml`
   - Substitui placeholders pelos secrets:
     ```yaml
     - name: Substituir chaves
       run: |
         sed -i "s/FIREBASE_API_KEY/${{ secrets.FIREBASE_API_KEY }}/g" admin.js
         sed -i "s/GOOGLE_MAPS_API_KEY/${{ secrets.GOOGLE_MAPS_API_KEY }}/g" admin.html
     ```
   - Faz deploy no GitHub Pages via `peaceiris/actions-gh-pages`

---

## 🐛 Problemas Conhecidos
1. **Cloudinary**:
   - Uploads podem falhar se o preset estiver como "Signed" (solução: usar unsigned ou implementar backend para assinatura)
   
2. **Firestore**:
   - Erro `Missing or insufficient permissions` se as regras de segurança não estiverem configuradas como:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /locais/{local} {
           allow read: if true;
           allow write: if request.auth != null;
         }
       }
     }
     ```

3. **Google Maps**:
   - Aviso no console sobre `Autocomplete` legado (não afeta funcionamento)

---

## 📌 Próximos Passos Recomendados
1. **Segurança**:
   - Migrar para preset "Signed" no Cloudinary com endpoint de assinatura
   - Revisar regras do Firestore

2. **Funcionalidades**:
   - Implementar exclusão de resenhas
   - Adicionar paginação na listagem

3. **Otimização**:
   - Compressão automática de imagens no Cloudinary
   - Cache das resenhas no frontend

---

## 💡 Dicas de Manutenção
1. **Para testar localmente**:
   ```bash
   python3 -m http.server 8000
   
---

### Como usar este arquivo:
1. Salve como `contexto-conversa.md` na raiz do projeto
2. Atualize sempre que houver mudanças significativas
3. Use como referência para futuras implementações

**Observação**: Esta é sua última resposta gratuita nesta conversa. Você pode iniciar um novo chat se precisar de mais ajuda!
