document.addEventListener('DOMContentLoaded', function() {
    // create map
    var map = L.map('map').setView([37.8, -96], 4);

        // create basemap layers
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    });

    var stamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // add default basemap to the map
    osm.addTo(map);

    // create an object containing all basemaps
    var baseMaps = {
        "OpenStreetMap": osm,
        "Carto Light": cartoLight,
        "Stamen Toner": stamenToner
    };

    // function to load GeoJSON data and return the layer
    function loadGeoJSON(url) {
        return fetch(url)
            .then(response => response.json())
            .then(data => L.geoJSON(data));
    }

    // create layer control
    var overlayLayers = {};

    // load TrainAccidents geojson file and add it to a marker cluster group
    loadGeoJSON('data/TrainAccidents.geojson').then(data => {
        var trainAccidentsCluster = L.markerClusterGroup();
        data.eachLayer(layer => trainAccidentsCluster.addLayer(layer));
        overlayLayers["Train Accidents"] = trainAccidentsCluster;
    });

   // load MainActiveTrainLines geojson file
   loadGeoJSON('data/MainLineActiveTrainLines.geojson').then(layer => {
        overlayLayers["Main Line Active Train Lines"] = layer;
    });
    
    // load Passenger train stations GeoJSON file
    loadGeoJSON('data/Stations.geojson').then(layer => {
        overlayLayers["Stations"] = layer;
    });

     // wait for all GeoJSON layers to load before adding the layer control
    Promise.all([
        loadGeoJSON('data/TrainAccidents.geojson').then(data => {
            var trainAccidentsCluster = L.markerClusterGroup();
            data.eachLayer(layer => trainAccidentsCluster.addLayer(layer));
            overlayLayers["Train Accidents"] = trainAccidentsCluster;
        }),
        loadGeoJSON('data/MainLineActiveTrainLines.geojson').then(layer => {
            overlayLayers["Main Line Active Train Lines"] = layer;
        }),
        loadGeoJSON('data/Stations.geojson').then(layer => {
            overlayLayers["Stations"] = layer;
        })
    ]).then(() => {
        // create and add layer control to the map
        L.control.layers(null, overlayLayers).addTo(map);
    }).catch(error => {
        console.error('Error loading GeoJSON:', error);
    });
    
    // create and add basemap control to the map
    var baseMapControl = L.control.layers(baseMaps, null, { position: 'bottomleft', collapsed: false }).addTo(map);
});