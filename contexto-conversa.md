# Contexto do Projeto "Xis Reviews POA"

## Objetivo
Site com mapa de Porto Alegre marcando os xis que visitei, usando:
- GitHub Pages (hospedagem)
- Google Maps API (mapa + marcadores)
- Firebase Firestore (resenhas)

## Códigos Implementados (resumo)

### HTML
- Estrutura básica com `div#map` e seção de resenhas.
- Scripts do Firebase e Google Maps.

### CSS
- Estilização do mapa e cards de resenhas.

### JavaScript
- Configuração do Firebase.
- Função `initMap()` com marcadores.
- Carregamento de resenhas do Firestore (`loadReviews()`).

### Firebase
- Coleção `reviews` com campos: `place`, `rating`, `review`, `lat`, `lng`.

## Próximos Passos
1. Formulário para adicionar novas resenhas.
2. Autenticação de usuários (opcional).
3. Filtros por nota/local.