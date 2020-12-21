let dashboard = {
  selectedCountry: 'world',
  arguments: {
    sortBy: 'Confirmed',
    sortReverseFirst: true,
    sortReverseSecond: true,
    period: 'Total',
    absValue: true
  },
  mapCovid: new MapCovid(),
  mapPie: new MapPie(),
  graphic: new graphicCreator(),
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
          return accumulator + +this.allInfo[currentValue].population;
        }, 0);
        updateData(true);
      })
      .catch(error => console.log('error', error));
  },

}

function addListeners() {
  // On/Off full screen mode
  document.querySelectorAll('.fullScreenBtn').forEach((button) => {
    button.addEventListener('click', (event) => {
      let target = event.target;
      while (target.tagName !== 'SECTION') {
        target = target.parentElement;
      }
      target.classList.toggle('fullScreen');
      document.querySelector('.control').classList.toggle('control-full-screen');
      document.querySelector('body').classList.toggle('bodyFullScreen');
      document.querySelector('.blackBG').classList.toggle('blackBG-On');
      dashboard.mapCovid.fullScreenMap();
      target.querySelector('img').src = `assets/images/${target.classList.contains('fullScreen')?'miniScreen':'fullScreen'}.png`
    });
  });


  // Open searsh
  document.querySelector('.searchBtn').addEventListener('click', () => {
    document.querySelector('.textarea').autofocus;
    document.querySelector('.searchContainer').classList.toggle('openSearchContainer');
    document.querySelector('.searchBtn__inset').classList.toggle('searchBtn__insetClose');
    if (!document.querySelector('.searchContainer').classList.contains('openSearchContainer')) {
      document.querySelector('.textarea').value = '';
      searchCountry('');
      selectLineAndArient(3);
      if (!document.querySelector('.keyboardContainer').classList.contains('keyboardContainerHidden')) {
        openCloseKeyboard();
      }
    }
  });

  // Open keyboard
  document.querySelector('.openKeyboardBtn').addEventListener('click', (event) => {
    document.querySelector('.textarea').autofocus;
    openCloseKeyboard();
  });

  // Looking for change search input
  document.querySelector('.textarea').addEventListener('input', () => {
    searchCountry(document.querySelector('.textarea').value);
    if (document.querySelector('.tableLine-selected') && !document.querySelector('.tableLine-selected').classList.contains('country-hidden')) {
      selectLineAndArient(3);
    }
  });

  // Passing the city
  document.querySelectorAll('.tabFTable__content, .tableSecond__content').forEach(el => {
    el.addEventListener('click', (event) => {
      let target = event.target;
      while (!target.classList.contains('fTableLine') && !target.classList.contains('tableSecond__line')) {
        target = target.parentElement;
      }
      selectCountry(target.getAttribute('name'), target.classList.contains('fTableLine') ? 1 : 2);
    });
  });

  // Change sort parameter
  document.querySelectorAll('.headerTable, .tableSecond__header').forEach(el => {
    el.addEventListener('click', (event) => {
      let target = event.target;
      if (target.classList.contains('fTableLine__Country') || target.parentElement.classList.contains('fTableLine__Country')) {
        return;
      }
      let oldSortBy = dashboard.arguments.sortBy;
      let oldReverseF = dashboard.arguments.sortReverseFirst;
      let oldReverseS = dashboard.arguments.sortReverseSecond;

      let changeView = () => {
        if (oldSortBy !== dashboard.arguments.sortBy) {
          updateData();
          changeSortBy();
          changeTableReverse('.tabFTable__content', false)
        } else {
          if (el.classList.contains('headerTable') && oldReverseF !== dashboard.arguments.sortReverseFirst) {
            changeTableReverse('.tabFTable__content', true);
          } else {
            changeTableReverse('.tableSecond__content', oldReverseS !== dashboard.arguments.sortReverseSecond);
          }
        }
      }

      if (target.tagName === 'IMG' || target.classList[0] === 'table__header_arrows' || target.className === 'tabFTable__header_text') {
        target = target.parentElement;
      }
      if (target.classList.contains('sortArrowTop') || target.classList.contains('sortArrowBottom')) {
        if (target.classList.contains('notActiveArrow')) {
          if (el.classList.contains('headerTable')) {
            dashboard.arguments.sortBy = target.parentElement.parentElement.className.substr(5);
            dashboard.arguments.sortReverseFirst = !target.classList.contains('sortArrowTop');
          } else {
            dashboard.arguments.sortReverseSecond = !target.classList.contains('sortArrowTop');
          }
          changeView();
        }
      } else {
        if (el.classList.contains('headerTable')) {
          dashboard.arguments.sortBy = target.className.substr(5);
          if (dashboard.arguments.sortBy === oldSortBy) {
            dashboard.arguments.sortReverseFirst = !dashboard.arguments.sortReverseFirst;
          }
        } else {
          dashboard.arguments.sortReverseSecond = !dashboard.arguments.sortReverseSecond;
        }
        changeView();
      }
    });
  });

  // Switch
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
            dashboard.arguments.sortBy = 'Confirmed';
          } else if (newRight >= percentMax / 4 && newRight < percentMax / 4 * 3) {
            dashboard.arguments.sortBy = 'Recovered';
          } else {
            dashboard.arguments.sortBy = 'Deaths';
          }
          changeSortBy();
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

// Open/Close Keyboard
function openCloseKeyboard() {
  let keyB = document.querySelector('.keyboardContainer');
  keyB.classList.toggle('keyboardContainerHidden');
  let voice;
  if (keyB.classList.contains('keyboardContainerHidden')) {
    voice = document.getElementById('closeKeyboardAudio');
  } else {
    voice = document.getElementById('openKeyboardAudio');
  }
  voice.currentTime = 0;
  voice.play();
}

// Update all data
function updateData(firstTime) {
  let arraySort = getSortedArray();
  let arrayReverse = dashboard.arguments.sortReverseFirst || dashboard.arguments.sortReverseSecond ? [...arraySort].reverse() : null;
  createFirstTable(dashboard.arguments.sortReverseFirst ? arrayReverse : arraySort);
  createSecondTable(dashboard.arguments.sortReverseSecond ? arrayReverse : arraySort);
  changeTableReverse('.tabFTable__content', false)
  selectLineAndArient(3);
  if (document.querySelector('.textarea').value) {
    searchCountry(document.querySelector('.textarea').value);
  }
  if (firstTime) {
    document.querySelector('.controlDate').innerText = `Data for ${new Date(dashboard.lastApdate).toLocaleString()}`;
    dashboard.mapCovid.renderMap();
    dashboard.mapPie.renderPie();
    dashboard.graphic.renderGraphic();
  }
  dashboard.mapCovid.redrawMap(arraySort);
  dashboard.graphic.rerenderGraphic();
}

// Select the country
function selectCountry(CountryCode, tableCount) {
  dashboard.selectedCountry = CountryCode === dashboard.selectedCountry ? 'world' : CountryCode;
  // View all countries
  document.querySelectorAll('.tableLine-selected').forEach(el => {
    el.classList.remove('tableLine-selected')
  });

  if (dashboard.selectedCountry === 'world') {
    document.querySelector('.controlCountry').innerText = 'WORLD';
  } else {
    document.querySelector('.controlCountry').innerText = dashboard.allInfo[CountryCode].Country;
  }
  selectLineAndArient(tableCount);
  dashboard.graphic.rerenderGraphic();
  dashboard.mapCovid.followSelectCountry();
  dashboard.mapPie.selectCountry();
}

// Select country line and scroll countries list
function selectLineAndArient(tableCount) {
  if (dashboard.selectedCountry !== 'world') {
    document.querySelectorAll(`.tableSecond__line[name=${dashboard.selectedCountry}] , .fTableLine[name=${dashboard.selectedCountry}]`).forEach(el => {
      el.classList.add('tableLine-selected');
    });
    let selectedLine = document.querySelector(`${tableCount === 1 ? '.tableSecond__content' : '.tabFTable__content'} .tableLine-selected`);
    let table = document.querySelector(tableCount === 1 ? '.tableSecond__content' : '.tabFTable__content');
    table.scrollTop = selectedLine.offsetTop - (tableCount === 1 || tableCount === 3 ? 130 : 110);
    if (tableCount === 3) {
      selectedLine = document.querySelector('.tableSecond__content .tableLine-selected');
      table = document.querySelector('.tableSecond__content');
      table.scrollTop = selectedLine.offsetTop - 130;
    } else {
      dashboard.mapCovid.followSelectCountry();
    }
  }
}

// Create First table
function createFirstTable(arraySort) {
  let str = '';
  arraySort.forEach((el) => {
    str += `
		<div class="fTableLine" name="${el.CountryCode}">
			<div class="fTableLine__Country">
				<div class="fTableLine__country_text">${el.Country}</div>
				<div class="fTableLine__country_flag"><img src="https://restcountries.eu/data/${el.flag? el.flag: 'afg'}.svg"></div>
			</div>
			<div class="text-Confirmed">${el[dashboard.arguments.period + 'Confirmed']}</div>
			<div class="text-Recovered">${el[dashboard.arguments.period + 'Recovered']}</div>
			<div class="text-Deaths">${el[dashboard.arguments.period + 'Deaths']}</div>
		</div>
		`;
  });
  ['Confirmed', 'Recovered', 'Deaths'].forEach(param => {
    document.querySelector(`.fTableGlobal .text-${param}`).innerText =
      dashboard.arguments.absValue ? dashboard.worldInfo[dashboard.arguments.period + param] :
      getImportanceValue(dashboard.worldInfo, dashboard.arguments.period + param);
  });

  document.querySelector('.tabFTable__content').innerHTML = str;
}

// Create Second table
function createSecondTable(arraySort) {
  let str = '';
  arraySort.forEach((el) => {
    str += `<div class="tableSecond__line" name="${el.CountryCode}">
		<div class="tableSecond__line__number text-${dashboard.arguments.sortBy}">${el[dashboard.arguments.period + dashboard.arguments.sortBy]}</div>
		<div class="tableSecond__line__name">${el.Country}</div>
		<div class="tableSecond__line__flag"><img src="https://restcountries.eu/data/${el.flag? el.flag: 'afg'}.svg"></div>
		</div>
		`;
  });
  document.querySelector('.tableSecond__content').innerHTML = str;
}

// Hide/show some countries
function searchCountry(str) {
  document.querySelectorAll('.tableSecond__line, .fTableLine:not(.headerTable):not(.fTableGlobal)').forEach(el => {
    let name = dashboard.allInfo[el.getAttribute('name')].Country;
    if (name.substring(0, str.length).toLowerCase() === str.toLowerCase()) {
      el.classList.remove('country-hidden');
    } else {
      el.classList.add('country-hidden');
    }
  });
}

// Reverse countries list
function changeTableReverse(tableClass, needReverse) {
  if (tableClass === '.tabFTable__content') {
    document.querySelector(`.tabFTable__header .table__header_arrows div:not(.notActiveArrow)`).classList.toggle('notActiveArrow');
    document.querySelector(`.tabFTable__header .text-${dashboard.arguments.sortBy} .sortArrow${dashboard.arguments.sortReverseFirst?'Bottom':'Top'}`).classList.toggle('notActiveArrow');
  } else {
    document.querySelector(`.tableSecond__header .table__header_arrows div:not(.notActiveArrow)`).classList.toggle('notActiveArrow');
    document.querySelector(`.tableSecond__header .sortArrow${dashboard.arguments.sortReverseSecond?'Bottom':'Top'}`).classList.toggle('notActiveArrow');
  }

  if (needReverse) {
    let table = document.querySelector(tableClass);
    let array = [...table.children].reverse();
    table.innerHTML = ''
    array.forEach(el => table.append(el));
    selectLineAndArient(3);
  }
}

// Change arrows
function changeSortBy() {
  let percentMax = 78;
  let percentMin = 1;
  let sortBy = dashboard.arguments.sortBy;
  let buttonRight = sortBy === 'Confirmed' ? percentMin : sortBy === 'Recovered' ? percentMax / 2 : percentMax;
  document.querySelector('.argum-changer__button[name=sortBy]').style.right = `${buttonRight}%`;
  document.querySelector(`.argum-container[name=sortBy]`).style.left = `-${(buttonRight - 1) / 7 * 18}%`;

  let secondH = document.querySelector('.tableSecond__header_country');
  secondH.className = `tableSecond__header_country text-${dashboard.arguments.sortBy}`;
  secondH.innerText = dashboard.arguments.sortBy;
  let secondArrow = document.querySelector('.tableSecond__header .table__header_arrows div:not(.notActiveArrow)');
  secondArrow.className = `${secondArrow.classList[0]} sortArrow${dashboard.arguments.sortBy}`;
  secondArrow = document.querySelector('.tableSecond__header .notActiveArrow');
  secondArrow.className = `${secondArrow.classList[0]} sortArrow${dashboard.arguments.sortBy} notActiveArrow`;
}

// Get sorted array
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
        element[param] = getImportanceValue(element, param);
      });
    });
  }
  for (key in dashboardCopy) {
    let el = dashboardCopy[key];
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
  }
  return arraySort;
}

function getImportanceValue(element, param) {
  return Math.floor(100000 / element.population * element[param]);
}

// Set update interval
function setUpdateInterval() {
  let timer = 60 * 60 * 1000;
  setInterval(() => {
    if (new Date().getHours() == 1) {
      updateData(true);
    }
  }, timer);
}

// Start session
function startSession() {
  addListeners();
  dashboard.addCovidInfo();
  setUpdateInterval();
}


startSession();