class Map {
    constructor() {
        this.dataCountry = [];
        this.countries = ['belarus', 'russia', 'poland'];
        this.southWest = L.latLng(-80.98155760646617, -190);
        this.northEast = L.latLng(89.99346179538875, 190);
        this.map = new L.Map('map', {
            center: [0, 0],
            minZoom: 2,
            zoom: 2,
            maxBounds: L.latLngBounds(this.southWest, this.northEast),
        });
        this.casesOptions= {
            radius: 30000,
            fill: true,
            fillColor: '#F73F3F',
            fillOpacity: 0.6,
            color: '#b32424',
        };
        this.getPositionCountry();
    }

    renderMap() {
        const tileLayer = new L.TileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=hjwgVWeFpBZKCpiJuubyxLQTlfaKby0nFconlrJRUxRilidPFenqyUvzELqTeEjR');
        this.map.addLayer(tileLayer);
    }

    renderCases() {
        this.dataCountry.forEach((country)=>{
            const casesCircle = L.circle([country.Lat, country.Lon], this.casesOptions);
            this.map.addControl(casesCircle);
        });
    }

    getPositionCountry() {
        this.countries.forEach((country)=>{
            this.getCountry(country).then(response => {
                this.dataCountry.push(response[0]);
            });
        });
    }

    async getCountry(name) {
        const result = await fetch(`https://api.covid19api.com/country/${name}/status/confirmed`);
        return await result.json();
    }

    redrawMap() {
        this.map.invalidateSize(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const map = new Map();
    map.renderMap();

    setTimeout(()=>{
        map.renderCases();
    }, 1500);
});
