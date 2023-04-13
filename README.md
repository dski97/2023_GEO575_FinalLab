# Train Accidents in the USA 2012-2022

### Team Members
1. Lisa Siewert
2. Dominic Cwalinski

### Introduction
Train accidents are not as common as other transportation accidents, which perhaps is why they are not viewed as a major threat.  Although railroads are not used as often as they were in centuries past, they remain quite active in transporting goods and people.  In fact, trains are still quite common in the United States—particularly subways and commuter trains utilizing approximately 600 railroads, hundreds of thousands of miles of tracks, and over 200,000 railroad crossings. Unfortunately, when train accidents happen, they often result in serious injuries and fatalities.  

This map hopes to inform rail safety outreach groups and public safety agencies about the spatial distribution of train accidents in the United States and provide a way to explore this data in the map. The user will be provided with information pertaining to the cause of the accident, financial loss due to the accident, injuries, accidents caused by the accident, and any safety changes made after the accident. 

### Final Proposal Outline
1. Persona/Scenario 
    1. Rail Safety Educator
        - Persona
            * Gary is an outreach coordinator for Operation Lifesaver, a non-profit public safety education and awareness organization, and is interested in being able to identify where and when rail accidents occur and describe the nature of the accident in the locations where he gives outreach presentations. By using this application, he will develop insights related to the occurrence and causation of rail accidents that he will use in his presentations and provide advice on how to avoid similar accidents in the future. He has experience with some slippy map programs
        - Scenario
            * The educator has the general goal of making people aware of the dangers around trains and to heed warning signs and signals.  When the user sees the interface, they form an intention of identifying where rail accidents occur in the location of their interest.  The user then specifies an action to enter the city name of their interest. The user then executes the action by entering the information and clicking a submission button. The user starts to perceive that some of the system has changed. They see the map and statistics populate and suddenly change. They start to evaluate the changes in the system. They notice how many rail accidents are in their area and interpret what that means. The user executes and evaluates the outcome finding that they need more information about the accidents on the map, so they click the points to obtain more details pertaining to the accident. 
    2. State or Local Public Safety Agencies (Office of the Commissioner of Railroads or City Police Department)
        - Persona
            * The public safety officer is concerned with ensuring the safety of the public at railroad crossings. They and their agency have primary responsibility for making determinations of the adequacy of warning devices at railroad crossings as well as approving the installation of new railroad crossings, alteration of existing crossings, and closing or consolidation of existing crossings. They are familiar with rail safety metrics and typically have a higher education that may involve coursework that utilizes mapping software like ArcGIS.  They can benefit from quantitative measurements of railroad crossing accidents. These metrics can be used to help justify funding for improving railroad crossings within their jurisdiction.
        - Scenario
            * The goal of the public safety officer is to improve the safety of the public at railroad crossings. The officer forms an intention when seeing the system to look at an area they know is one of the best or worst crossings in their jurisdiction. They want to compare what they know to be true with what is in the application. They specify the action of panning and zooming across the map and clicking on the area they are interested in. They execute this action as planned based on prior tool experience. They perceive the change in the system. They can see the map and statistics populate and change. They interpret the state of the system and compare the crossing metrics with their local knowledge of the crossing. They evaluate the outcome by determining how accurate the tool is according to their personal knowledge. Then they can use the information to advocate for improved safety at that railroad crossing point. 
        
2. Requirements Document
    
    
| Representation |   |   |
| -------- | -------- | -------- |
| 1 | Basemap | Zoomed toward the Outline of the US States: OPM Mapnik / Stamer TonerLite / Stadia Smooth Dark https://leaflet-extras.github.io/leaflet-providers/preview/  |
| 2 | Train Routes  | USA Railroads (Active and Inactive) Provided by ESRI and the NGDA (National Geospatial Data Asset). OpenRailWay Tileset may be used depending on App Usability.  Train Tile Mapset from OPM (OpenRailRoadMap) http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png' https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Railroads_1/FeatureServer  |
| 3 | Train Accidents  | Rail Equipment Accidents (6180.54) for the Years 2012-2022 as reported by the Federal Railroad Administration https://safetydata.fra.dot.gov/OfficeofSafety/publicsite/on_the_fly_download.aspx  |
| 4 | Legend  | Visually represents the rail and rail accident types.  |
| 5 | Overview  | Documentation on the maps layers and how to use the web application.  |
| 6 | Train Passenger Stations  | Passenger Rail Train Stations Provided by USDOT BTS https://data-usdot.opendata.arcgis.com/datasets/usdot::north-american-rail-network-nodes/explore  |
| 7 | Interactive Data Count Feed  | Based on user Queries, the Display will show the count of accidents that occurred.  |

| Interaction |   |   |
| -------- | -------- | -------- |
| 1 | Query | Filter. Location, time, attribute. Adjust the initial query parameters for the train accident data.  |
| 2 | Basemap Toggle  | Overlay. Map display. Change the way the map features are displayed on the sticky map.   |
| 3 | Route Selection   | Retrieve. Objects. Hover over the route to learn the Rail code of the railroad owning company.   |
| 4 | Accident Selection   | Retrieve. Objects. Hover over the accident to learn more information regarding the accident.   |
| 5 | Change Display of Accidents   | Resymbolize. Objects. Change the display of the feature symbols based on what the user wants to see shown on the map.   |
| 6 | Rate-based scrolling   | Pan and Zoom. Allow the User to pan over the map and zoom while exploring the map features.   |
| 7 | Cluster Display   | Resymbolize. Cluster points at the start extent of the map. Changes at different scales.   |


3.  Wireframes
    
    ![Wireframe1](https://github.com/dski97/2023_GEO575_FinalLab/raw/main/img/Wireframe1.png)
    
    **Wireframe 1:** Pop-up that informs the user of the purpose of the map and the data sources.  Tips on how to interact with the map will be included.  The main map content will be greyed out behind the popup. 
    
    ![Wireframe2](https://github.com/dski97/2023_GEO575_FinalLab/raw/main/img/Wireframe2.png)
    
    **Wireframe 2:** This is the main map interface.  There will be a slider that the user can use to view different datasets by year—a train icon will be used as the slider control.  If the user would like to view all years, they can click the button.  Then the user can filter by accident type, railroad company, cause of incident, and the weather at the time of the accident.  Different symbols will be used to identify (all symbols from the Noun Project and creator attributes and data sources will be included at the bottom of the page.
    
    ![Wireframe3](https://github.com/dski97/2023_GEO575_FinalLab/raw/main/img/Wireframe3.png)

    **Wireframe 3:** When the user clicks on the railroad polylines or accident points, a popup box will appear with additional information about that location pulled from our datasets.       
