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

    // Custom style for train track lines
    const trainTrackStyle = {
        color: '#000000', // Set the color of the lines
        weight: 5, // Set the width of the lines
        opacity: 0.5, // Set the opacity of the lines
        dashArray: '1, 10', // Set the dash pattern for the lines
        lineCap: 'round', // Set the line cap style
        lineJoin: 'round' // Set the line join style
    };
    
    // Custom style for highlighted train track lines
    const highlightedTrainTrackStyle = {
        color: '#ff7800',
        weight: 7,
        opacity: 1
    };

    // Function to get the appropriate icon based on the "Type of Accident" value
    function getAccidentIcon(typeOfAccident) {
        switch (typeOfAccident) {
            case 'Highway-Rail Crossing':
                return 'img/HighwayRail.gif';
            case 'Other (Described in Narrative)':
                return 'img/Other.png';
            case 'Derailment':
                return 'img/TrainDerailment.png';
            case 'Broken Train Collision':
                return 'img/BrokenTrain.png';
            case 'Fire / Violent Rupture':
                return 'img/Fire.png';
            case 'Head On Collision':
                return 'img/Collision.png';
            case 'Obstruction':
                return 'img/Obstruction.png';
            case "Other Impacts":
                return 'img/OtherImpact.png';
            case 'Raking Collision':
                return 'img/Raking.png';
            case 'Rearend Collision':
                return 'img/RearEnd.png';
            case 'RR Grade Crossing':
                return 'img/RRCrossing.png';
            case 'Side Collision':
                return 'img/SideHit.png';
            default:
                return 'img/Train.png'; // Set a default icon in case the value doesn't match any cases
        }
}

    //consildated function to filter train accidents by year and type of accident
    function filterTrainAccidents(year, accidentType) {
        // Add the loading-cursor class to the body element
        document.body.classList.add('loading-cursor');
    
        // Clear the existing layers
        trainAccidentsCluster.clearLayers();
    
        // Add a setTimeout with a 0ms delay to allow the browser to update the cursor style
        setTimeout(() => {
            // Perform the task of filtering and adding layers
            trainAccidentsData.eachLayer(layer => {
                if (
                    (year === 'All' || layer.feature.properties.Year === year) &&
                    (accidentType === 'All' || layer.feature.properties['Type of Accident'] === accidentType)
                ) {
                    trainAccidentsCluster.addLayer(layer);
                }
            });
    
            // Update the visible accidents count
            document.getElementById('accident-count').textContent = trainAccidentsCluster.getLayers().length;
    
            // Remove the loading-cursor class from the body element
            document.body.classList.remove('loading-cursor');
        }, 0);
    }

    //update accident count
    function updateAccidentCount(count) {
        document.getElementById('accident-count').textContent = count;
    }

    // Create layer control
    const overlayLayers = {};

    //declare trainAccidentsData and trainAccidentsCluster
    let trainAccidentsData;
    let trainAccidentsCluster = L.markerClusterGroup();

    map.addLayer(trainAccidentsCluster);

    // Wait for all GeoJSON layers to load before adding the layer control
    Promise.all([
        // Load TrainAccidents geojson file and add it to a marker cluster group
        loadGeoJSON('data/TrainAccidents.geojson', {
            pointToLayer: (feature, latLng) => {
                const iconUrl = getAccidentIcon(feature.properties['Type of Accident']);
                const icon = L.icon({ iconUrl: iconUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [0, -41] });

                const marker = L.marker(latLng, { icon: icon });

                // Create a popup with all the properties from the GeoJSON feature
                const popupContent = Object.entries(feature.properties)
                    .map(([key, value]) => `<b>${key}:</b> ${value}`)
                    .join('<br>');

                marker.bindPopup(popupContent);

                return marker;
            }
        }).then(data => {
            trainAccidentsData = data;
            trainAccidentsData.eachLayer(layer => trainAccidentsCluster.addLayer(layer));
            overlayLayers["Train Accidents"] = trainAccidentsCluster;
            updateAccidentCount(trainAccidentsCluster.getLayers().length);

         //add evemt listener to the slider
         document.getElementById('year-input').addEventListener('input', function (event) {
            const year = parseInt(event.target.value);
            const accidentType = document.getElementById('accident-type-dropdown').value;
            const yearLabel = document.getElementById('year-label');
            yearLabel.textContent = year === 2011 ? 'All' : year;
            filterTrainAccidents(year === 2011 ? 'All' : year, accidentType);
        });
        //add event listener to the reset button
        document.getElementById('year-reset').addEventListener('click', function () {
            const accidentType = document.getElementById('accident-type-dropdown').value;
            const yearInput = document.getElementById('year-input');
            const yearLabel = document.getElementById('year-label');
            yearInput.value = '0';
            yearLabel.textContent = 'All';
            filterTrainAccidents('All', accidentType);
        });
        
        //add event listener to the dropdown
        document.getElementById('accident-type-dropdown').addEventListener('change', function (event) {
            const accidentType = event.target.value;
            const yearInput = document.getElementById('year-input');
            const year = yearInput.value == '2011' ? 'All' : yearInput.value;
            filterTrainAccidents(year, accidentType);
        });

        }),
        loadGeoJSON('data/MainLineActiveTrainLines.geojson', {
            style: trainTrackStyle,
            onEachFeature: (feature, layer) => {
                if (feature.properties) {
                    const railroadOwnerCode = feature.properties.RR_OWNER;
                    layer.bindPopup(`<b>Railroad Owner Code:</b> ${railroadOwnerCode}`);
        
                    layer.on('click', (e) => {
                        layer.setStyle(highlightedTrainTrackStyle);
                    });
        
                    layer.on('popupclose', (e) => {
                        layer.setStyle(trainTrackStyle);
                    });
                }
            }
        }).then(layer => {
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