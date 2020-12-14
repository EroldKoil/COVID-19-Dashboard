class MapCovid {

    constructor() {
        this.southWest = L.latLng(-80.98155760646617, -185);
        this.northEast = L.latLng(89.99346179538875, 185);
        this.map = new L.Map('map', {
            center: [0, 0],
            zoom: 2,
            maxZoom: 9,
            maxBounds: L.latLngBounds(this.southWest, this.northEast),
        });
        this.markerLayer = L.featureGroup();
    }

    renderMap() {
        const tileLayer = new L.TileLayer('https://tile.jawg.io/6a531b2b-270b-4f38-af60-86177cec21ad/{z}/{x}/{y}.png?lang=en&access-token=hjwgVWeFpBZKCpiJuubyxLQTlfaKby0nFconlrJRUxRilidPFenqyUvzELqTeEjR', {
            minZoom: 2,
            attribution: '<a href=\\"https://www.jawg.io\\" target=\\"_blank\\">&copy; Jawg</a> - <a href=\\"https://www.openstreetmap.org\\" target=\\"_blank\\">&copy; OpenStreetMap</a>&nbsp;contributors',
            updateInterval: 10,
        });
        this.map.addLayer(tileLayer);
    }

    renderCircleMarker(data) {
        const selectSort = `${dashboard.arguments.period}${dashboard.arguments.sortBy}`;
        const selectColor = this.getColorMarker(dashboard.arguments.sortBy);
        for (let key in data) {
            let percentOfCases = (data[key][selectSort]/ dashboard.worldInfo[selectSort]) * 100;
            const casesCircle = L.circleMarker([data[key].coords.lat, data[key].coords.lon], {
                radius: percentOfCases < 1 ? 4 : percentOfCases,
                fill: true,
                fillColor: selectColor,
                fillOpacity: 0.7,
                color: selectColor,
                opacity: 1,
                width: 5,
            }).addTo(this.markerLayer);
            this.initMouseEvent(data[key], undefined, casesCircle);
        }
        this.map.addControl(this.markerLayer);
    }


    renderBorderCountry(dataCountries) {
        let coordsCountry;
        let coordinate;
        let borderCountry;

        for (let key in geoCountries.features) {
            coordsCountry = this.correctionOfCoords(geoCountries.features[key].geometry.coordinates);
            coordinate = L.GeoJSON.coordsToLatLngs(coordsCountry, 2);
            borderCountry = L.polygon(coordinate, {
                stroke: false,
                fill: true,
                fillColor: 'white',
                fillOpacity: 0
            });

            this.map.addControl(borderCountry);

            for (let country in dataCountries) {
                this.initMouseEvent(dataCountries[country], geoCountries.features[key], borderCountry);
            }
        }
        this.renderCircleMarker(dataCountries);
    }

    getColorMarker(typeData) {
        if(typeData.includes('Confirmed')) {
            return '#33953D';
        }
        if(typeData.includes('Recovered')) {
            return '#598bc1';
        }
        if(typeData.includes('Deaths')) {
            return '#cd1b1b';
        }
    }

    correctionOfCoords(value) {
        let depthArray = value => {
            return Array.isArray(value) ?
                1 + Math.max(...value.map(depthArray)) :
                0;
        }
        return depthArray(value) === 3 ? [value] : value;
    }

    initMouseEvent(country, countryZone, element) {
        const blockInfoCountry = document.getElementById('popupBlock');

        blockInfoCountry.onmouseover = () => {
            blockInfoCountry.classList.add('show-popup-block');
            blockInfoCountry.classList.remove('hide-popup-block');
        }
        blockInfoCountry.onmouseout = () => {
            blockInfoCountry.classList.remove('show-popup-block');
            blockInfoCountry.classList.add('hide-popup-block');
        }

        if (countryZone !== undefined) {
            if (country.CountryCode.toLowerCase() === countryZone.properties.iso_a2.toLowerCase()) {
                element.on('mouseover', this.showMoreInfo.bind(element, country, blockInfoCountry, false));
                element.on('mouseout', this.hideMoreInfo.bind(element, blockInfoCountry, false));
            }
        } else {
            element.on('mouseover', this.showMoreInfo.bind(element, country, blockInfoCountry, true));
            element.on('mouseout', this.hideMoreInfo.bind(element, blockInfoCountry, true));
        }
    }

    showMoreInfo(country, blockInfoCountry, markerCircle) {
        const flagCountry = document.querySelector('.popup-img');
        const nameCountry = document.querySelector('.popup-name');
        const valueCountry = document.getElementById('popup-value');
        const titleValueCountry = document.querySelector('.popup-value-title');
        const populationCountry = document.querySelector('.popup-population');

        flagCountry.src = `https://restcountries.eu/data/${country.flag}.svg`;
        nameCountry.textContent = country.Country;
        titleValueCountry.textContent = `${dashboard.arguments.sortBy}: `;
        valueCountry.className = '';
        valueCountry.classList.add(`popup-value-${dashboard.arguments.sortBy.toLowerCase()}`)
        valueCountry.textContent = country[`${dashboard.arguments.period}${dashboard.arguments.sortBy}`].toLocaleString();
        populationCountry.textContent = country.population.toLocaleString();
        blockInfoCountry.classList.add('show-popup-block');
        blockInfoCountry.classList.remove('hide-popup-block');
        if (markerCircle === false) {
            this.setStyle({
                fillOpacity: 0.1
            });
        }
    }

    hideMoreInfo(blockInfoCountry, markerCircle) {
        blockInfoCountry.classList.remove('show-popup-block');
        blockInfoCountry.classList.add('hide-popup-block');
        if (markerCircle === false) {
            this.setStyle({
                fillOpacity: 0
            });
        }
    }

    clearMarker() {
        this.markerLayer.clearLayers();
        this.map.removeControl(this.markerLayer);
    }

    fullScreenMap() {
        this.map.invalidateSize(false);
    }

    redrawMap(data) {
        this.clearMarker();
        this.renderBorderCountry(data);
        this.map.invalidateSize(false);
    }
}

