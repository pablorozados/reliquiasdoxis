// ... (código anterior permanece igual) ...

function setupRatings() {
  // Nota (estrelas)
  const notaOptions = document.querySelectorAll('#nota-rating .rating-option');
  notaOptions.forEach(option => {
    option.addEventListener('click', () => {
      notaOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedNota = parseInt(option.dataset.value);
    });
  });

  // Sujeira comendo (hambúrgueres)
  const sujeiraOptions = document.querySelectorAll('#sujeira-rating .rating-option');
  sujeiraOptions.forEach(option => {
    option.addEventListener('click', () => {
      sujeiraOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedSujeira = parseInt(option.dataset.value);
    });
  });

  // Cagada depois (cocôs)
  const cagadaOptions = document.querySelectorAll('#cagada-rating .rating-option');
  cagadaOptions.forEach(option => {
    option.addEventListener('click', () => {
      cagadaOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedCagada = parseInt(option.dataset.value);
    });
  });
}

// ... (restante do código permanece igual) ...
