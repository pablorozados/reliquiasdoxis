# 📚 Documentação - Relíquias do Xis POA

## 🌟 Visão Geral
Sistema de avaliação de estabelecimentos de hambúrguer (xis) em Porto Alegre com:
- Mapa interativo com todas as resenhas
- Painel administrativo para cadastro
- Autenticação segura
- Upload de fotos

**URL:** [pablorozados.github.io/reliquiasdoxis](https://pablorozados.github.io/reliquiasdoxis)

---

## 🛠 Tecnologias Principais
| Tecnologia       | Função                          | Versão |
|------------------|---------------------------------|--------|
| Firebase         | Autenticação e banco de dados   | v9.21.0|
| Google Maps API  | Mapa e geolocalização           | v3     |
| Cloudinary       | Armazenamento de imagens        | v1     |
| GitHub Pages     | Hospedagem                      | -      |

---

## 📂 Estrutura de Arquivos
reliquiasdoxis/
├── index.html # Página principal com mapa
├── admin.html # Painel de administração
├── style.css # Estilos globais
├── DOCUMENTACAO.md # Este arquivo
└── .github/
└── workflows/
└── deploy.yml # CI/CD automático


---

## 🔑 Chaves Necessárias
### GitHub Secrets (obrigatórias)
| Secret               | Descrição                     |
|----------------------|-------------------------------|
| `FIREBASE_API_KEY`   | Chave da API do Firebase      |
| `FIREBASE_PROJECT_ID`| ID do projeto Firebase        |
| `GOOGLE_MAPS_API_KEY`| Chave da API do Google Maps   |

### Cloudinary (configuração manual)
- Cloud Name: `dgdjaz541`
- Upload Preset: `reliquias_do_xis` (unsigned)

---

## 🗺 Funcionalidades do Mapa
1. **Visualização de Resenhas**:
   - Marcadores coloridos
   - Animação de "queda" ao carregar
   - Efeito de bounce ao clicar

2. **Filtros Automáticos**:
   - Remove POIs (shoppings, hospitais)
   - Mantém apenas ruas e bairros

3. **Janelas de Informação**:
   - Foto do xis (ampliável)
   - Avaliação com emojis
   - Texto completo da resenha

---

## 🔐 Painel Administrativo
### Recursos:
- **Login Seguro**:
  - Autenticação por e-mail/senha
  - Controle de sessão

- **Formulário Completo**:
  ```javascript
  {
    nome: "Nome do lugar",
    latitude: -30.0000,
    longitude: -51.0000,
    resenha: "Texto da avaliação",
    meu_pedido: "Xis especial com...",
    nota: 4,           // 0-5 estrelas
    sujeira_comendo: 3, // 0-5 hambúrgueres
    cagada_depois: 2,   // 0-5 cocôs
    imagem: "URL",      // Opcional
    timestamp: Data     // Automático
  }

  Upload de Fotos:

Direto para o Cloudinary

Preview antes de enviar

Limite de 5MB

🚀 Fluxo de Deploy
Push para main → GitHub Actions executa:

Substitui placeholders pelas secrets

Faz deploy no GitHub Pages

Arquivos modificados:
- name: Substituir chaves
  run: |
    sed -i "s/FIREBASE_API_KEY/${{ secrets.FIREBASE_API_KEY }}/g" *.html
    sed -i "s/FIREBASE_PROJECT_ID/${{ secrets.FIREBASE_PROJECT_ID }}/g" *.html
    sed -i "s/GOOGLE_MAPS_API_KEY/${{ secrets.GOOGLE_MAPS_API_KEY }}/g" *.html

  🐛 Problemas Conhecidos
Cloudinary:

Uploads podem falhar se o navegador bloquear pop-ups

Firebase:

Necessária regra de segurança:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /locais/{local} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

📌 Próximas Melhorias (Sugestões)
Adicionar filtro por bairro

Sistema de favoritos

Compartilhamento em redes sociais

✂️ Atualizado em: 25/04/2025
🔧 Versão: 2.0
📧 Contato: pablorozados@gmail.com


### Como usar este arquivo:
1. Copie todo o conteúdo acima
2. Crie um novo arquivo chamado `contexto-conversa.md` na pasta principal
3. Substitua  pela data de hoje
4. Adicione seu e-mail no campo de contato

### O que este documento inclui:
- Todas as configurações técnicas
- Fluxo completo do sistema
- Problemas conhecidos e soluções
- Estrutura do projeto
- Guia de manutenção

Você pode atualizar este arquivo sempre que fizer novas modificações no projeto!
