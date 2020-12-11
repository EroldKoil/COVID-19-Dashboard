class Map {
    constructor() {
        this.southWest = L.latLng(-80.98155760646617, -190);
        this.northEast = L.latLng(89.99346179538875, 190);
        this.mapOptions = {
            center: [0,0],
            minZoom: 2,
            zoom: 2,
            maxBounds: L.latLngBounds(this.southWest, this.northEast),
        }
        this.map = new L.Map('map', this.mapOptions);
    }

    renderMap() {
        let tileLayer = new L.TileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=hjwgVWeFpBZKCpiJuubyxLQTlfaKby0nFconlrJRUxRilidPFenqyUvzELqTeEjR');
        this.map.addLayer(tileLayer);
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
   let map = new Map();
   map.renderMap();
});