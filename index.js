function addListeners() {

  // Вкл/выкл полноэкранного режима
  document.querySelectorAll('.fullScreenBtn').forEach((button) => {
    button.addEventListener('click', (event) => {
      let target = event.target;
      while (target.tagName !== 'SECTION') {
        target = target.parentElement;
      }
      target.classList.toggle('fullScreen');
      // изменение картинки для кнопки
      target.querySelector('img').src = `assets/images/${target.classList.contains('fullScreen')?'miniScreen':'fullScreen'}.png`
    });
  });
}

// Открытие поиска
document.querySelector('.searchBtn').addEventListener('click', (event) => {
  document.querySelector('.textarea').autofocus;
  let keyboardContainer = document.querySelector('.keyboardContainer');
  if (keyboardContainer.classList.length == 2) {
    keyboardContainer.classList.remove('keyboardContainerHidden');
    if (!isMute) {
      let voice = document.getElementById('openKeyboardAudio');
      voice.currentTime = 0;
      voice.play();
    }
  }
});


function startSession() {
  addListeners();
}

startSession();