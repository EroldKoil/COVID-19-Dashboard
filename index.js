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
        this.worldInfo.population = Object.keys(this.allInfo).reduce((accumulator, currentValue) => {
          console.log(this.allInfo[currentValue].population);
          return accumulator + +this.allInfo[currentValue].population;
        }, 0);
        save();
        //createSecondTable(this.allInfo, 'Confirmed', 'Total');
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
      document.querySelector('.tabFTable__header_arrows div:not(.notActiveArrow)').classList.toggle('notActiveArrow');
      document.querySelector(`.fTableLine__${dashboard.arguments.sortBy} .sortArrow${dashboard.arguments.sortReverse?'Top':'Bottom'}`).classList.toggle('notActiveArrow');
      createFirstTable();
    }

    if (target.tagName === 'IMG' || target.classList[0] === 'tabFTable__header_arrows' || target.className === 'tabFTable__header_text') {
      target = target.parentElement;
    }
    if (target.classList[0] === 'sortArrowTop' || target.classList[0] === 'sortArrowBottom') {
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

  // Работа переключателей
  document.querySelectorAll('.argum-changer__button').forEach(el => {
    el.style.right = '1%';
    el.onmousedown = (event) => {
      let oldArguments = Object.assign({}, dashboard.arguments);
      let coordX = event.clientX;
      let containerWidth = el.parentElement.offsetWidth;
      let elName = el.getAttribute('name');
      let right = el.style.right.substr(0, el.style.right.length - 1);
      let argumentDom = document.querySelector(`.argum-container[name=${elName}]`);
      let coordXMin;
      let coordXMax;
      let newRight = right;
      let percentMax = 78;
      let percentMin = 1;


      if (dashboard.arguments[elName] === true ||
        dashboard.arguments[elName] === 'Total' ||
        dashboard.arguments[elName] === 'Confirmed') {
        coordXMin = coordX - containerWidth * percentMax / 100;
        coordXMax = coordX;
      } else if (dashboard.arguments[elName] === false ||
        dashboard.arguments[elName] === 'New' ||
        dashboard.arguments[elName] === 'Deaths') {
        coordXMin = coordX;
        coordXMax = coordX + containerWidth * percentMax / 100;
      } else {
        coordXMin = coordX - containerWidth / 2 * percentMax / 100;
        coordXMax = coordX + containerWidth / 2 * percentMax / 100;
      }

      document.onmouseup = () => {
        el.style.transitionDuration = '0.3s';
        argumentDom.style.transitionDuration = '0.3s';

        if (el.getAttribute('argumentsCount') === '3') {
          if (newRight < percentMax / 4) {
            newRight = percentMin;
            dashboard.arguments.sortBy = 'Confirmed';
          } else if (newRight >= percentMax / 4 && newRight < percentMax / 4 * 3) {
            newRight = percentMax / 2;
            dashboard.arguments.sortBy = 'Recovered';
          } else {
            newRight = percentMax;
            dashboard.arguments.sortBy = 'Deaths';
          }
          el.style.right = `${newRight}%`;
          argumentDom.style.left = `-${(newRight - 1) / 7 * 18}%`;
        } else {
          if (newRight < percentMax / 2) {
            newRight = percentMin;
            dashboard.arguments[elName] = elName === 'period' ? 'Total' : true;
          } else {
            newRight = percentMax;
            dashboard.arguments[elName] = elName === 'period' ? 'New' : false;
          }
          el.style.right = `${newRight}%`;
          argumentDom.style.left = `-${(newRight - percentMin) / (percentMax - percentMin) * 100}%`;
        }
        Object.keys(dashboard.arguments).forEach(key => {
          if (dashboard.arguments[key] !== oldArguments[key]) {
            updateData();
          }
        });
        document.onmousemove = null;
        document.onmouseup = null;
      }

      document.onmousemove = (event1) => {
        el.style.transitionDuration = '0s';
        argumentDom.style.transitionDuration = '0s';
        if (event1.clientX < coordXMin) {
          newRight = percentMax;
        } else if (event1.clientX > coordXMax) {
          newRight = percentMin;
        } else {
          newRight = +right + (100 / containerWidth * (coordX - event1.clientX));
        }
        el.style.right = `${newRight}%`;

        if (el.getAttribute('argumentsCount') === '3') {
          argumentDom.style.left = `-${(newRight - 1) / 7 * 6 * 3}%`;
        } else {
          argumentDom.style.left = `-${(newRight - 1) / 77 * 100}%`;
        }
      }
    }
  });
}

function updateData() {
  let arraySort = getSortedArray();
  createFirstTable(arraySort);
  //  createSecondTable(arraySort /*dashboard.allInfo, 'Confirmed', 'Total'*/ );
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

function createSecondTable(arraySort /*array, argument, period, absValue*/ ) {
  let str = '';

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
    return Math.floor(100000 / elem.population * +elem[dashboard.arguments.period + param]);
  }
}

function createFirstTable(arraySort) {
  let str = '';
  arraySort.forEach((el) => {
    str += `
		<div class="fTableLine">
			<div class="fTableLine__Country">
				<div class="fTableLine__country_text">${el.Country}</div>
				<div class="fTableLine__country_flag"><img src="https://restcountries.eu/data/${el.flag? el.flag: 'afg'}.svg"></div>
			</div>
			<div class="fTableLine__Confirmed">${el[dashboard.arguments.period + 'Confirmed']}</div>
			<div class="fTableLine__Recovered">${el[dashboard.arguments.period + 'Recovered']}</div>
			<div class="fTableLine__Deaths">${el[dashboard.arguments.period + 'Deaths']}</div>
		</div>
		`;
  });
  ['Confirmed', 'Recovered', 'Deaths'].forEach(param => {
    document.querySelector(`.fTableGlobal .fTableLine__${param}`).innerText =
      dashboard.arguments.absValue ? dashboard.worldInfo[dashboard.arguments.period + param] :
      Math.floor(100000 / dashboard.worldInfo.population * dashboard.worldInfo[dashboard.arguments.period + param]);
  });

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

function getSortedArray() {
  let dashboardCopy = JSON.parse(JSON.stringify(dashboard.allInfo));
  let arraySort = [];
  let sortBy = dashboard.arguments.sortBy;
  let period = dashboard.arguments.period;
  let absValue = dashboard.arguments.absValue;

  if (!absValue) {
    Object.keys(dashboardCopy).forEach(key => {
      let element = dashboardCopy[key];
      ['NewConfirmed', 'NewDeaths', 'NewRecovered', 'TotalConfirmed', 'TotalDeaths', 'TotalRecovered'].forEach(param => {
        element[param] = Math.floor(100000 / element.population * element[param]);
      });
    });
  }
  for (key in dashboardCopy) {
    let el = dashboardCopy[key];

    //  if (sortBy !== 'Country') {
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
    /*  } else {
        arraySort.push(el);
      }*/
  }
  return arraySort.reverse();
}


function startSession() {
  addListeners();
  if (localStorage.getItem('covidLocalDataBase')) {
    dashboard = JSON.parse(localStorage.getItem('covidLocalDataBase'));
    updateData();
  } else {
    dashboard.addCovidInfo();
  }
}

function save() {
  localStorage.setItem('covidLocalDataBase', JSON.stringify(dashboard));
}

startSession();