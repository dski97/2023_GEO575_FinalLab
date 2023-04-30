document.addEventListener('DOMContentLoaded', () => {
    // Create map
    const map = L.map('map').setView([37.8, -96], 4);
    
    //basemap tile options
    const tileLayerOptions = { maxZoom: 18, minZoom: 2, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' };
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', tileLayerOptions);
    const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { ...tileLayerOptions, attribution: tileLayerOptions.attribution + ' &copy; <a href="https://carto.com/attributions">CARTO</a>' });
    const stamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png', { ...tileLayerOptions, attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' + tileLayerOptions.attribution });

    // Add default basemap to the map
    osm.addTo(map);

    // Create an object containing all basemaps
    const baseMaps = { "OpenStreetMap": osm, "Carto Light": cartoLight, "Stamen Toner": stamenToner };

    

    // Create a Leaflet easyButton and add it to the map
    L.easyButton({
        states: [{
            stateName: 'home',
            icon: '&#x1f3e0;', // Unicode house character
            title: 'Zoom to original extent',
            onClick: function (btn, map) {
                map.setView([37.8, -96], 4);
            }
        }]
    }).addTo(map);

    // Function to load GeoJSON data and return the layer
    const loadGeoJSON = async (url, options) => {
        const response = await fetch(url);
        const data = await response.json();
        return L.geoJSON(data, options);
    };

    //load railroad names
    const loadRailroadCompanyNames = async () => {
        const response = await fetch('data/RailNames.txt');
        const text = await response.text();
        return text.split('\n');
    };

    //autocomplete the search bar
    function autocomplete(input, data) {
        let currentFocus;
    
        input.addEventListener("input", function () {
            let list, item, value = this.value;
    
            closeAllLists();
            if (!value) {
                return false;
            }
            currentFocus = -1;
            list = document.createElement("div");
            list.setAttribute("id", this.id + "-autocomplete-list");
            list.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(list);
    
            for (let i = 0; i < data.length; i++) {
                if (data[i].substr(0, value.length).toUpperCase() === value.toUpperCase()) {
                    item = document.createElement("div");
                    item.innerHTML = "<strong>" + data[i].substr(0, value.length) + "</strong>";
                    item.innerHTML += data[i].substr(value.length);
                    item.innerHTML += "<input type='hidden' value='" + data[i] + "'>";
                    item.addEventListener("click", function () {
                        input.value = this.getElementsByTagName("input")[0].value;
                        closeAllLists();
                        // Calling the filter function here with the selected company name
                        const yearInput = document.getElementById('year-input');
                        const year = yearInput.value == '2011' ? 'All' : yearInput.value;
                        const accidentType = document.getElementById('accident-type-dropdown').value;
                        const companyName = input.value;
                        filterTrainAccidents(year, accidentType, companyName);
                    });
                    list.appendChild(item);
                }
            }
        });
    
        input.addEventListener("keydown", function (e) {
            let items = document.getElementById(this.id + "-autocomplete-list");
            if (items) {
                items = items.getElementsByTagName("div");
            }
            if (e.keyCode === 40) { // Arrow down
                currentFocus++;
                setActive(items);
            } else if (e.keyCode === 38) { // Arrow up
                currentFocus--;
                setActive(items);
            } else if (e.keyCode === 13) { // Enter
                e.preventDefault();
                if (currentFocus > -1 && items) {
                    items[currentFocus].click();
                }
            }
        });
    
        function setActive(items) {
            if (!items) {
                return false;
            }
            removeActive(items);
            if (currentFocus >= items.length) {
                currentFocus = 0;
            }
            if (currentFocus < 0) {
                currentFocus = items.length - 1;
            }
            items[currentFocus].classList.add("autocomplete-active");
        }
    
        function removeActive(items) {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.remove("autocomplete-active");
            }
        }
    
        function closeAllLists(element) {
            let items = document.getElementsByClassName("autocomplete-items");
            for (let i = 0; i < items.length; i++) {
                if (element !== items[i] && element !== input) {
                    items[i].parentNode.removeChild(items[i]);
                }
            }
        }
    }
    
    loadRailroadCompanyNames().then(railroadCompanyNames => {
        const railroadCompanySearch = document.getElementById("railroad-company-search");
        autocomplete(railroadCompanySearch, railroadCompanyNames);
    });

    // Custom train station icon
    const trainStationIcon = L.icon({
        iconUrl: 'img/Train_Station_Icon.png',
        iconSize: [65, 65], 
        iconAnchor: [12, 25],
        popupAnchor: [0, -25] 
    });

    // Custom style for train track lines
    const trainTrackStyle = {
        color: '#808080', 
        weight: 6, 
        opacity: 0.8, 
        dashArray: '3, 15', 
        lineCap: 'square', 
        lineJoin: 'square'
    };
    
    // Custom style for highlighted train track lines
    const highlightedTrainTrackStyle = {
        color: '#ff7800',
        weight: 7,
        opacity: 1
    };

    // Function to get the appropriate icon based on the "Type of Accident" value
    function getAccidentIcon(typeOfAccident) {
        const iconMap = {
            'Highway-Rail Crossing': 'img/Highway_Rail_Crossing_Icon.png',
            'Other (Described in Narrative)': 'img/Other_Icon.png',
            'Derailment': 'img/Derailment_Icon.png',
            'Broken Train Collision': 'img/Broken_Train_Collision_Icon.png',
            'Fire / Violent Rupture': 'img/Fire_Icon.png',
            'Head On Collision': 'img/Head_on_Collision_Icon.png',
            'Obstruction': 'img/Obstruction_Icon.png',
            'Other Impacts': 'img/Other_Impacts_Icon.png',
            'Raking Collision': 'img/Raking_Collision_Icon.png',
            'Rearend Collision': 'img/Rearend_Collision_Icon.png',
            'RR Grade Crossing': 'img/RR_Grade_Crossing_Icon.png',
            'Side Collision': 'img/Side_Hit_Icon.png'
        };
    
        return iconMap[typeOfAccident] || 'img/Train.png'; // Use the default icon if the value is not found in the map
    }

    //consildated function to filter train accidents by year and type of accident, and railroad company name
    function filterTrainAccidents(year, accidentType, companyName) {
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
                    (accidentType === 'All' || layer.feature.properties['Type of Accident'] === accidentType) &&
                    (companyName === 'All' || layer.feature.properties['Railroad'] === companyName)
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
                const icon = L.icon({ iconUrl: iconUrl, iconSize: [100, 100], iconAnchor: [12, 41], popupAnchor: [0, -41] });
                const marker = L.marker(latLng, { icon: icon });
                // Create an array of the properties you want to display in the popup, with their display names
                const displayProperties = [
                    { key: 'Date', displayName: 'Date' },
                    { key: 'Railroad', displayName: 'Railroad' },
                    { key: 'Time', displayName: 'Time' },
                    { key: 'Type of Accident', displayName: 'Type of Accident' },
                    { key: 'Temperature (F)', displayName: 'Temperature (F)' },
                    { key: 'Visibility', displayName: 'Visibility' },
                    { key: 'Weather', displayName: 'Weather' },
                    { key: 'Total Reportable Damage on All Reports in $', displayName: 'Total Reportable Damage $' },
                    { key: 'Total Injured', displayName: 'Total Injured' },
                    { key: 'Total Killed', displayName: 'Total Killed' },
                    { key: 'Narrative', displayName: 'Report of Event' }
                ];
                
                // Create the popup content by mapping the display properties to a string of HTML
                const popupContent = displayProperties
                    .map(({ key, displayName }) => `<b>${displayName}:</b> ${feature.properties[key]}`)
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
                const companyName = document.getElementById('railroad-company-search').value || 'All';
                const yearLabel = document.getElementById('year-label');
                yearLabel.textContent = year === 2011 ? 'All' : year;
                filterTrainAccidents(year === 2011 ? 'All' : year, accidentType, companyName);
        });
        //add event listener to the reset button
            document.getElementById('year-reset').addEventListener('click', function () {
                const accidentType = document.getElementById('accident-type-dropdown').value;
                const companyName = document.getElementById('railroad-company-search').value || 'All';
                const yearInput = document.getElementById('year-input');
                const yearLabel = document.getElementById('year-label');
                yearInput.value = '0';
                yearLabel.textContent = 'All';
                filterTrainAccidents('All', accidentType, companyName);
        });
        
        //add event listener to the dropdown
            document.getElementById('accident-type-dropdown').addEventListener('change', function (event) {
            const accidentType = event.target.value;
            const yearInput = document.getElementById('year-input');
            const year = yearInput.value == '2011' ? 'All' : yearInput.value;
            const companyName = document.getElementById('railroad-company-search').value || 'All';
            filterTrainAccidents(year, accidentType, companyName);
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

function openPopup() {
  window.location.hash = 'openModal';
}

window.onload = openPopup;