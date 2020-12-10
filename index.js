const dashboard = {
  selectedCountry: 'world',
  // argument - критерий для отбора данных: заражение / смерти / исцеление
  // period - за какой период рассматривается информация
  // absValue - рассматриваются абсолютные величины или в рвсчете на 100 тыс. населения
  globalTable: {
    argument: 'death',
    period: 'full',
    absValue: 'abs'
  },
  map: {
    argument: 'death',
    period: 'full',
    absValue: 'abs'
  },
  miniTable: {
    argument: 'death',
    period: 'full',
    absValue: 'abs'
  },
  graf: {
    argument: 'death',
    period: 'full',
    absValue: 'abs'
  },
  allInfo: {}

}

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
    /*let selectedCountry = document.querySelector('.globalTable__line_selected:not(.globalTable__line-hidden)');
    if (!selectedCountry) {
      document.querySelector('.globalTable__line_selected').classList.remove('.globalTable__line_selected');
      let array = document.querySelectorAll('.globalTable__line:not(.globalTable__line-hidden)');
      if (array.length > 0) {
        array[0].classList.add('.globalTable__line_selected');
      }
    }*/
  });

  // Клик по таблице стран
  document.querySelector('.globalTable').addEventListener('click', (event) => {
    let target = event.target;
    if (target.classList[0] !== 'globalTable') {
      while (target.classList[0] != 'globalTable__line') {
        target = target.parentElement;
      }
      selectCountry(target);
    }
  });
}


function selectCountry(tag) {
  if (dashboard.selectedCountry !== 'world') {
    document.querySelector('.globalTable__line_selected').classList.remove('globalTable__line_selected');
  }
  tag.classList.add('globalTable__line_selected');
  dashboard.selectedCountry = tag.querySelector('.globalTable__line__name').innerText;
  document.querySelector('.topNumber__discription').innerText = dashboard.selectedCountry;
}

// argument - критерий для отбора данных: ('Confirmed' or 'Deaths' or 'Recovered')
// period - за какой период рассматривается информация ('New' or 'Total')
// absValue - рассматриваются абсолютные величины или в рвсчете на 100 тыс. населения (true for absolute)

function createSecondTable(array, argument, period, absValue) {
  console.log('createSecondTable');
  console.log(array);
  let str = '';
  let arraySort = [];

  array.forEach((el) => {
    let number = el[period + argument];
    let obj = { name: el.Country, num: number };
    console.log('a');
    if (arraySort.length === 0) {
      arraySort.push(obj);
    } else {
      let flag = false;
      for (let i = 0; i < arraySort.length; i++) {
        if (arraySort[i].num >= obj.num && (i === 0 || (arraySort[i - 1].num <= obj.num))) {
          arraySort.splice(i, 0, obj);
          flag = true;
          break;
        }
      }
      if (!flag) {
        arraySort.push(obj);
      }
    }
  });


  arraySort.reverse().forEach((el) => {
    str += `<div class="globalTable__line">
		<div class="globalTable__line__number">${el.num}</div>
		<div class="globalTable__line__name">${el.name}</div>
		</div>
		`;
  });
  document.querySelector('.globalTable').innerHTML = str;
}

function getInfo() {
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  fetch("https://api.covid19api.com/summary", requestOptions)
    .then(response => response.text())
    .then(result => {
      dashboard.allInfo = JSON.parse(result)
      createSecondTable(dashboard.allInfo.Countries, 'Confirmed', 'Total');
    })
    .catch(error => console.log('error', error));
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
  getInfo();
}

startSession();