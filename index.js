let dashboard = {
  selectedCountry: 'world',
  // argument - критерий для отбора данных: ('Confirmed' or 'Deaths' or 'Recovered')
  // period - за какой период рассматривается информация ('New' or 'Total')
  // absValue - рассматриваются абсолютные величины или в рвсчете на 100 тыс. населения (true for absolute)
  arguments: {
    sortBy: 'Confirmed',
    sortReverse: false,
    period: 'Total',
    absValue: true
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
          this.allInfo[el.CountryCode] = {
            Country: el.Country,
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
    fetch("https://restcountries.eu/rest/v2/all?fields=name;population;flag;latlng;alpha2Code")
      .then(response => response.text())
      .then(result => {
        let object = JSON.parse(result);
        object.forEach((el) => {
          if (this.allInfo[el.alpha2Code] !== undefined) {
            this.allInfo[el.alpha2Code].flag = el.flag.substr(el.flag.length - 7, 3);
            this.allInfo[el.alpha2Code].population = el.population;
            this.allInfo[el.alpha2Code].coords = { lat: el.latlng[0], lon: el.latlng[1] };
          }
        });
        save();
        createSecondTable(this.allInfo, 'Confirmed', 'Total');
        createFirstTable();
      })
      .catch(error => console.log('error', error));
  },


  addStatsPerDays() {
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

  // Изменение сортировки в первой таблице
  document.querySelector('.headerTable').addEventListener('click', (event) => {
    let target = event.target;
    let sortBy = '';

    let changeView = () => {
      dashboard.arguments.sortBy = sortBy;
      console.log('sortBy = ' + dashboard.arguments.sortBy);
      console.log('revers = ' + dashboard.arguments.sortReverse);
      document.querySelector('.tabFTable__header_arrows div:not(.notActiveArrow)').classList.toggle('notActiveArrow');
      document.querySelector(`.fTableLine__${dashboard.arguments.sortBy} .sortArrow${dashboard.arguments.sortReverse?'Top':'Bottom'}`).classList.toggle('notActiveArrow');
      createFirstTable();
    }

    if (target.tagName === 'IMG' || target.classList[0] === 'tabFTable__header_arrows' || target.className === 'tabFTable__header_text') {
      target = target.parentElement;
    }
    if (target.classList[0] === 'sortArrowTop' || target.classList[0] === 'sortArrowBottom') {
      console.log('arrow');
      if (target.classList.contains('notActiveArrow')) {
        sortBy = target.parentElement.parentElement.className.substr(12);
        dashboard.arguments.sortReverse = target.classList.contains('sortArrowTop');
        changeView();
      }
    } else {
      sortBy = target.className.substr(12);
      if (sortBy !== dashboard.arguments.sortBy) {
        dashboard.arguments.sortReverse = true;
      }
      dashboard.arguments.sortReverse = !dashboard.arguments.sortReverse;
      changeView();
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
    let obj = { name: dashboard.allInfo[key].Country, num: number, flag: el.flag, slug: key };

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
    str += `<div class="globalTable__line" name="${el.slug}">
		<div class="globalTable__line__number">${el.num}</div>
		<div class="globalTable__line__name">${el.name}</div>
		<div class="globalTable__line__flag"><img src="https://restcountries.eu/data/${el.flag? el.flag: 'afg'}.svg"></div>
		</div>
		`;
  });
  document.querySelector('.globalTable').innerHTML = str;
}

function getValue(param, elem) {
  if (dashboard.arguments.absValue) {
    return elem[dashboard.arguments.period + param];
  } else {
    return 100000 / elem.population * +elem[dashboard.arguments.period + param];
  }
}

function createFirstTable() {
  let str = '';
  let arraySort = getSortedArray(dashboard.arguments.sortBy, dashboard.arguments.sortReverse, dashboard.arguments.period);

  arraySort.forEach((el) => {
    str += `
		<div class="fTableLine">
			<div class="fTableLine__Country">
				<div class="fTableLine__country_text">${el.Country}</div>
				<div class="fTableLine__country_flag"><img src="https://restcountries.eu/data/${el.flag? el.flag: 'afg'}.svg"></div>
			</div>
			<div class="fTableLine__Confirmed">${getValue('Confirmed' , el)}</div>
			<div class="fTableLine__Recovered">${getValue('Recovered' , el)}</div>
			<div class="fTableLine__Deaths">${getValue('Deaths' , el)}</div>
		</div>
		`;
  });
  document.querySelector('.fTableGlobal .fTableLine__Confirmed').innerText = getValue('Confirmed', dashboard.worldInfo);
  document.querySelector('.fTableGlobal .fTableLine__Recovered').innerText = getValue('Recovered', dashboard.worldInfo);
  document.querySelector('.fTableGlobal .fTableLine__Deaths').innerText = getValue('Deaths', dashboard.worldInfo);

  document.querySelector('.tabFTable__content').innerHTML = str;
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

function getSortedArray(sortBy, sortReverse, period) {
  let arraySort = [];

  for (key in dashboard.allInfo) {
    let el = dashboard.allInfo[key];
    if (sortBy !== 'Country') {
      let number = el[period + sortBy];

      if (arraySort.length === 0) {
        arraySort.push(el);
      } else {
        let flag = false;
        for (let i = 0; i < arraySort.length; i++) {
          if (arraySort[i][period + sortBy] >= number && (i === 0 || (arraySort[i - 1][period + sortBy] <= number))) {
            arraySort.splice(i, 0, el);
            flag = true;
            break;
          }
        }
        if (!flag) {
          arraySort.push(el);
        }
      }
    } else {
      arraySort.push(el);
    }
  }
  if (!sortReverse) {
    arraySort = arraySort.reverse()
  }
  return arraySort;
}

function getInfo() {
  if (localStorage.getItem('covidLocalDataBase')) {
    dashboard = JSON.parse(localStorage.getItem('covidLocalDataBase'));
    createSecondTable(dashboard.allInfo, 'Confirmed', 'Total');
    createFirstTable()
  } else {
    dashboard.addCovidInfo();
  }

}

function startSession() {
  addListeners();
  getInfo();
}

function save() {
  localStorage.setItem('covidLocalDataBase', JSON.stringify(dashboard));
}

startSession();