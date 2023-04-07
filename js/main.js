document.addEventListener('DOMContentLoaded', function() {
    // create map
    var map = L.map('map').setView([37.8, -96], 4);

    // add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // function to load GeoJSON data and return the layer
    function loadGeoJSON(url) {
        return fetch(url)
            .then(response => response.json())
            .then(data => L.geoJSON(data));
    }

    // create layer control
    var overlayLayers = {};

    // load Passenger train stations GeoJSON file
    loadGeoJSON('data/Stations.geojson').then(layer => {
        overlayLayers["Stations"] = layer;
    });

    // load MainActiveTrainLines geojson file
    loadGeoJSON('data/MainLineActiveTrainLines.geojson').then(layer => {
        overlayLayers["Main Line Active Train Lines"] = layer;
    });

    // load TrainAccidents geojson file and add it to a marker cluster group
    loadGeoJSON('data/TrainAccidents.geojson').then(data => {
        var trainAccidentsCluster = L.markerClusterGroup();
        data.eachLayer(layer => trainAccidentsCluster.addLayer(layer));
        overlayLayers["Train Accidents"] = trainAccidentsCluster;
    });

    // wait for all GeoJSON layers to load before adding the layer control
    Promise.all([
        loadGeoJSON('data/Stations.geojson'),
        loadGeoJSON('data/MainLineActiveTrainLines.geojson'),
        loadGeoJSON('data/TrainAccidents.geojson')
    ]).then(layers => {
        // create and add layer control to the map
        L.control.layers(null, overlayLayers).addTo(map);
    }).catch(error => {
        console.error('Error loading GeoJSON:', error);
    });
});
