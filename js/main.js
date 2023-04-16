document.addEventListener('DOMContentLoaded', () => {
    // Create map
    const map = L.map('map').setView([37.8, -96], 4);

    // Create basemap layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    });

    const stamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Add default basemap to the map
    osm.addTo(map);

    // Create an object containing all basemaps
    const baseMaps = {
        "OpenStreetMap": osm,
        "Carto Light": cartoLight,
        "Stamen Toner": stamenToner
    };

    // Function to load GeoJSON data and return the layer
    const loadGeoJSON = async (url, options) => {
        const response = await fetch(url);
        const data = await response.json();
        return L.geoJSON(data, options);
    };

    // Custom train station icon
    const trainStationIcon = L.icon({
        iconUrl: 'img/TrainStation.png',
        iconSize: [25, 25], // Set the size of the icon, if needed
        iconAnchor: [12, 25], // Set the anchor point of the icon, if needed
        popupAnchor: [0, -25] // Set the anchor point of the popup, if needed
    });
    

    // Create layer control
    const overlayLayers = {};

    // Wait for all GeoJSON layers to load before adding the layer control
    Promise.all([
        loadGeoJSON('data/TrainAccidents.geojson').then(data => {
            const trainAccidentsCluster = L.markerClusterGroup();
            data.eachLayer(layer => trainAccidentsCluster.addLayer(layer));
            overlayLayers["Train Accidents"] = trainAccidentsCluster;
        }),
        loadGeoJSON('data/MainLineActiveTrainLines.geojson').then(layer => {
            overlayLayers["Main Line Active Train Lines"] = layer;
        }),
        loadGeoJSON('data/Stations.geojson', {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, { icon: trainStationIcon });
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties) {
                    const state = feature.properties.STATE;
                    const stationName = feature.properties.PASSNGRSTN;
                    layer.bindPopup(`<b>State:</b> ${state}<br><b>Train Station Name:</b> ${stationName}`);
                }
            }
        }).then(layer => {
            overlayLayers["Stations"] = layer;
        })
    ]).then(() => {
        // Create and add layer control to the map
        L.control.layers(null, overlayLayers).addTo(map);
    }).catch(error => {
        console.error('Error loading GeoJSON:', error);
    });
    
    // Create and add basemap control to the map
    const baseMapControl = L.control.layers(baseMaps, null, { position: 'bottomleft', collapsed: false }).addTo(map);
});