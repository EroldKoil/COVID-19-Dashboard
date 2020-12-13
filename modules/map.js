class Map {

    constructor() {
        this.southWest = L.latLng(-80.98155760646617, -185);
        this.northEast = L.latLng(89.99346179538875, 185);
        this.map = new L.Map('map', {
            center: [0, 0],
            zoom: 2,
            maxZoom: 9,
            maxBounds: L.latLngBounds(this.southWest, this.northEast),
        });
    }

    renderMap() {
        const tileLayer = new L.TileLayer('https://tile.jawg.io/6a531b2b-270b-4f38-af60-86177cec21ad/{z}/{x}/{y}.png?lang=en&access-token=hjwgVWeFpBZKCpiJuubyxLQTlfaKby0nFconlrJRUxRilidPFenqyUvzELqTeEjR', {
            minZoom: 2,
            attribution: '<a href=\\"https://www.jawg.io\\" target=\\"_blank\\">&copy; Jawg</a> - <a href=\\"https://www.openstreetmap.org\\" target=\\"_blank\\">&copy; OpenStreetMap</a>&nbsp;contributors',
            updateInterval: 10,
        });
        this.map.addLayer(tileLayer);
    }

    renderCases(data) {
        for (let key in data) {
            let percentOfCases = (data[key].TotalConfirmed / dashboard.worldInfo.TotalConfirmed) * 100;
            const casesCircle = L.circleMarker([data[key].coords.lat, data[key].coords.lon], {
                radius: percentOfCases <1? 4: percentOfCases,
                fill: true,
                fillColor: '#F73F3F',
                fillOpacity: 0.7,
                color: '#F73F3F',
                opacity: 1,
                width:5,
            });
            casesCircle.bindTooltip(`<div class="map-toolTip" ><img class="map-toolTip-img" src="https://restcountries.eu/data/${data[key].flag}.svg"><span class="map-toolTip-text">${data[key].Country}</span></div>`).openTooltip();

            casesCircle.on('mouseover',this.showMoreInfo.bind(this,data[key]));
            casesCircle.on('mouseout',this.hideMoreInfo);

            this.map.addControl(casesCircle);
        }
    }

    showMoreInfo(country) {
        const blockInfoCountry = document.getElementById('popupBlock');
        const flagCountry = document.querySelector('.popup-img');
        const nameCountry = document.querySelector('.popup-name');
        const valueCountry = document.querySelector('.popup-value');
        const titleValueCountry = document.querySelector('.popup-value-title');
        const populationCountry = document.querySelector('.popup-population');

        flagCountry.src = `https://restcountries.eu/data/${country.flag}.svg`;
        nameCountry.textContent = country.Country;
        valueCountry.textContent =country.TotalConfirmed.toLocaleString();
        titleValueCountry.textContent ='Cases: ';
        populationCountry.textContent = country.population.toLocaleString();
        blockInfoCountry.classList.add('show-popup-block');
        blockInfoCountry.classList.remove('hide-popup-block');
    }

    hideMoreInfo () {
        const blockInfoCountry = document.getElementById('popupBlock');
        blockInfoCountry.classList.remove('show-popup-block');
        blockInfoCountry.classList.add('hide-popup-block');
    }

    redrawMap() {
        this.map.invalidateSize(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const map = new Map();
    map.renderMap();

    setTimeout(() => {
        console.log(dashboard.allInfo);
        map.renderCases(dashboard.allInfo);
    }, 1500);
});
