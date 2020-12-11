const dashboard = {
  selectedCountry: 'world',
  // argument - критерий для отбора данных: заражение / смерти / исцеление
  // period - за какой период рассматривается информация
  // absValue - рассматриваются абсолютные величины или в рвсчете на 100 тыс. населения
  globalTable: {
    argument: 'death',
    period: 'global',
    absValue: 'abs'
  },
  map: {
    argument: 'death',
    period: 'global',
    absValue: 'abs'
  },
  miniTable: {
    argument: 'death',
    period: 'global',
    absValue: 'abs'
  },
  graf: {
    argument: 'death',
    period: 'global',
    absValue: 'abs'
  },
  allInfo: {},
  worldInfo: {},
  lastApdate: 0,

  requestOptions: {
    method: 'GET',
    redirect: 'follow'
  },

  addCovidInfo() {
    fetch("https://api.covid19api.com/summary", this.requestOptions)
      .then(response => response.text())
      .then(result => {
        let object = JSON.parse(result);
        object.Countries.forEach((el) => {
          this.allInfo[el.Country] = {
            CountryCode: el.CountryCode,
            NewConfirmed: el.NewConfirmed,
            NewDeaths: el.NewDeaths,
            NewRecovered: el.NewRecovered,
            TotalConfirmed: el.TotalConfirmed,
            TotalDeaths: el.TotalDeaths,
            TotalRecovered: el.TotalRecovered
          }
        });
        this.worldInfo = {
          NewConfirmed: object.Global.NewConfirmed,
          NewDeaths: object.Global.NewDeaths,
          NewRecovered: object.Global.NewRecovered,
          TotalConfirmed: object.Global.TotalConfirmed,
          TotalDeaths: object.Global.TotalDeaths,
          TotalRecovered: object.Global.TotalRecovered
        }
        this.lastApdate = object.Countries[0].Date;
        this.addPopulationAndFlag();
      })
      .catch(error => console.log('error', error));
  },

  addPopulationAndFlag() {
    fetch("https://restcountries.eu/rest/v2/all?fields=name;population;flag;latlng")
      .then(response => response.text())
      .then(result => {
        let object = JSON.parse(result);
        object.forEach((el) => {
          if (this.allInfo[el.name] !== undefined) {
            this.allInfo[el.name].flag = el.flag.substr(el.flag.length - 7, 3);
            this.allInfo[el.name].population = el.population;
            this.allInfo[el.name].coords = { lat: el.latlng[0], lon: el.latlng[1] };
          }
        });
        createSecondTable(this.allInfo, 'Confirmed', 'Total');
      })
      .catch(error => console.log('error', error));
  },


  addCoordsAndStatsPerDays() {
    let j = 0;
    let i = 0;
    let interval = setInterval(() => {
      let str = Object.keys(this.allInfo)[i];
      console.log('country = ' + Object.keys(this.allInfo)[i]);
      fetch(`https://api.covid19api.com/live/country/${Object.keys(this.allInfo)[i]}/status/confirmed`, this.requestOptions)
        .then(response => response.text())
        .then(result => {

          let country = JSON.parse(result);
          console.log('end ' + str);
          if (country.success !== false) {
            console.log('end 2 ' + str);
            console.log(country);
            this.allInfo[country[0].CountryCode].coords = { lat: country[0].Lat, lon: country[0].Lon };

            country.forEach((month) => {
              let m = {
                Confirmed: month.Confirmed,
                Deaths: month.Deaths,
                Recovered: month.Recovered,
                Active: month.Active,
                Date: month.Date
              };

              if (this.allInfo[month.CountryCode].monthInfo) {
                this.allInfo[month.CountryCode].monthInfo.push(m);
              } else {
                this.allInfo[month.CountryCode].monthInfo = [m];
              };
            })
            j++;
            if (j >= this.allInfo.length) {

            }
          }
        }).catch(error => {
          console.log('error', error);
          j++;
        });
      i++;
      if (i >= Object.keys(this.allInfo).length) {
        clearInterval(interval);
        return;
      }
    }, 800);
  }

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
  let str = '';
  let arraySort = [];

  for (key in array) {
    let el = array[key];
    let number = el[period + argument];
    let obj = { name: key, num: number, flag: el.flag };

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
  }


  arraySort.reverse().forEach((el) => {
    str += `<div class="globalTable__line">
		<div class="globalTable__line__number">${el.num}</div>
		<div class="globalTable__line__name">${el.name}</div>
		<div class="globalTable__line__flag"><img src="https://restcountries.eu/data/${el.flag? el.flag: 'afg'}.svg"></div>
		</div>
		`;
  });
  document.querySelector('.globalTable').innerHTML = str;
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

function getInfo() {
  dashboard.addCovidInfo();
}

function startSession() {
  addListeners();
  getInfo();
}

startSession();