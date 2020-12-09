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


  // Открытие поиска
  document.querySelector('.searchBtn').addEventListener('click', () => {
    document.querySelector('.textarea').autofocus;
    document.querySelector('.searchContainer').classList.toggle('openSearchContainer');
    document.querySelector('.searchBtn__inset').classList.toggle('searchBtn__insetClose');
  });

  // открытие клавы
  document.querySelector('.openKeyboardBtn').addEventListener('click', (event) => {
    document.querySelector('.textarea').autofocus;
    let keyboardContainer = document.querySelector('.keyboardContainer');
    keyboardContainer.classList.toggle('keyboardContainerHidden');
    if (!isMute) {
      let voice = document.getElementById('openKeyboardAudio');
      voice.currentTime = 0;
      voice.play();
    }
  });

  // Изменение строки поиска
  document.querySelector('.textarea').addEventListener('input', () => {
    searchCountry(document.querySelector('.textarea').value);
  });


}
// argument - критерий для отбора данных: заражение / смерти / исцеление
// period - за какой период рассматривается информация
// absValue - рассматриваются абсолютные величины или в рвсчете на 100 тыс. населения

function createSecondTable(array, argument, period, absValue) {
  let str = '';
  array.forEach((el) => {
    str += `<div class="globalTable__line">
		<div class="globalTable__line__number">${getSumm(el.ill)}</div>
		<div class="globalTable__line__name">${el.country}</div>
		</div>
		`;
  });
  document.querySelector('.globalTable').innerHTML = str;
}

// Считает сумму показателей из массива
function getSumm(array) {
  return array.reduce((accum, cV) => accum + cV);
}

// Изменяет видимость линий в таблице 1 в зависимости от строки поиска
function searchCountry(str) {
  let array = document.querySelectorAll('.globalTable__line');
  array.forEach((el) => {
    let name = el.querySelector('.globalTable__line__name').innerText;
    if (name.substr(0, str.length).toLowerCase() == str.toLowerCase()) {
      el.classList.remove('globalTable__line-hidden');
    } else {
      el.classList.add('globalTable__line-hidden');
    }
  });
}

function startSession() {
  addListeners();
  createSecondTable(data);
}

startSession();