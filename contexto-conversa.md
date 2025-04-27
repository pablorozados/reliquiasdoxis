# 📚 Documentação Atualizada - Relíquias do Xis POA

## 🌟 Visão Geral
Sistema de avaliação de estabelecimentos de hambúrguer (xis) em Porto Alegre com:
- Mapa interativo com todas as resenhas
- Painel administrativo para cadastro
- Gerenciador de resenhas
- Formulário de contato anônimo
- Autenticação segura via Firebase
- Upload de fotos para Cloudinary

**URL oficial:** [pablorozados.github.io/reliquiasdoxis](https://pablorozados.github.io/reliquiasdoxis)  
**Repositório:** [github.com/pablorozados/reliquiasdoxis](https://github.com/pablorozados/reliquiasdoxis)

---

## 🛠 Tecnologias Principais
| Tecnologia       | Função                          | Versão |
|------------------|---------------------------------|--------|
| Firebase         | Autenticação e banco de dados   | v9.21.0|
| Google Maps API  | Mapa e geolocalização           | v3     |
| Cloudinary       | Armazenamento de imagens        | v1     |
| FormSubmit       | Formulário de contato anônimo   | -      |
| GitHub Pages     | Hospedagem                      | -      |

---

## 📂 Estrutura de Arquivos Atualizada
reliquiasdoxis/
├── index.html # Página principal com mapa
├── admin.html # Painel de administração
├── gerenciar.html # Gerenciador de resenhas
├── contato.html # Formulário de contato anônimo
├── sobre.html # Página sobre o autor
├── obrigado.html # Página de confirmação
├── style.css # Estilos globais
├── script.js # Lógica do mapa
├── context.md # Documentação do projeto
└── .github/
└── workflows/
└── deploy.yml # CI/CD automático


---

## 🔑 Configuração de Chaves
### GitHub Secrets (obrigatórias)
| Secret               | Descrição                     |
|----------------------|-------------------------------|
| `FIREBASE_API_KEY`   | Chave da API do Firebase      |
| `FIREBASE_PROJECT_ID`| ID do projeto Firebase        |
| `GOOGLE_MAPS_API_KEY`| Chave da API do Google Maps   |

**Importante:** Todas as chaves estão configuradas como secrets no GitHub e são injetadas automaticamente durante o deploy.

### Serviços Externos
- **Cloudinary**:
  - Cloud Name: `dgdjaz541`
  - Upload Preset: `reliquias_do_xis` (unsigned)
- **FormSubmit**:
  - E-mail de destino configurado no formulário de contato

---

## 🗺 Funcionalidades Principais

### Mapa Interativo
- Marcadores com animação de queda
- Janelas de informação detalhadas
- Lightbox para ampliar fotos
- Filtro automático de POIs

### Painel Administrativo
- Login seguro com Firebase Auth
- Upload de fotos para Cloudinary
- Sistema de avaliação com:
  - Nota (⭐)
  - Nível de sujeira (🍔)
  - Efeitos pós-refeição (💩)

### Novas Funcionalidades
1. **Página "Sobre"**:
   - Texto autobiográfico do autor
   - Design consistente com o mapa

2. **Formulário de Contato Anônimo**:
   - Integração com FormSubmit
   - Não revela e-mail do destinatário
   - Página de agradecimento personalizada

3. **Rodapé Fixo**:
   - Links para Sobre e Contato
   - Avisos importantes

---

## 🚀 Fluxo de Deploy
```yaml
name: Deploy Seguro
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Substituir chaves
        run: |
          sed -i "s/FIREBASE_API_KEY/${{ secrets.FIREBASE_API_KEY }}/g" *.html
          sed -i "s/FIREBASE_PROJECT_ID/${{ secrets.FIREBASE_PROJECT_ID }}/g" *.html
          sed -i "s/GOOGLE_MAPS_API_KEY/${{ secrets.GOOGLE_MAPS_API_KEY }}/g" *.html
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./

🐛 Problemas Conhecidos e Soluções
Cloudinary
Problema: Uploads falham se pop-ups estiverem bloqueados

Solução: Instruir usuários para permitir pop-ups

Firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /locais/{local} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
FormSubmit
Limite de 100 envios/mês no plano gratuito

Possível delay de 2-3 minutos para recebimento

📌 Roadmap (Próximas Melhorias)
Filtro por bairro

Sistema de favoritos

Compartilhamento em redes sociais

Página de estatísticas

Dark mode

✂️ Atualizado em: {{DATA_ATUAL}}
🔧 Versão: 2.1
📧 Contato: [e-mail privado nos secrets do GitHub]


### Como usar:
1. Substitua `{{DATA_ATUAL}}` pela data de hoje (formato DD/MM/YYYY)
2. Adicione este arquivo como `DOCUMENTACAO.md` no seu repositório
3. Atualize sempre que fizer novas modificações

### Destaques:
- ✔️ Todas as novas páginas documentadas
- ✔️ Fluxo de contato anônimo explicado
- ✔️ Configurações de segurança destacadas
- ✔️ Roadmap atualizado
- ✔️ Mantém o tom descontraído do projeto
