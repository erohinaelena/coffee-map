import React, {Component} from 'react'
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFpbm9sbWEiLCJhIjoiY2sydTl6b2I1MTJ5YjNjbzM5OW0yZzJiNCJ9.dw7PAO_N-lz7WEjppx1v1w';

class Map extends Component {
    componentDidMount() {
        const bounds = [
            [36.5535610167, 55.1281419266], // Southwest coordinates
            [38.6738519565, 56.3505776833]  // Northeast coordinates
        ];
        this.map = new mapboxgl.Map({
            container: 'map',
            //style: 'mapbox://styles/mainolma/ck3k1p5hn1dcb1dmz8ondz21n',  // This is STYLE with CUPS font
            style: 'mapbox://styles/mapbox/light-v9',
            center: [37.623597, 55.751583],
            minZoom: 9,
            zoom: 9.7,
            maxBounds: bounds,
            //doubleClickZoom: false,
        });
        this.map.addControl(new mapboxgl.NavigationControl({showZoom: true, showCompass: false}));
        this.translateMap();
        this.zoomThreshold = 11;
        this.props.updateBounds(this.map.getBounds());
        this.initialized = false;
        this.initMap();
        const markerEl = document.createElement('div');
        markerEl.className = 'marker';

        this.theMarker = new mapboxgl.Marker(markerEl);
    }

    componentDidUpdate(prevProps) {
        if (
            !prevProps.pointsData != this.props.pointsData &&
            !prevProps.contursData != this.props.contursData &&
            !this.initialized
        ) {
            this.initMap();
        }

        if (
            prevProps.filteredItemsList !== this.props.filteredItemsList &&
            this.map.getLayer('locations')
        ) {
            const filterNames = this.props.filteredItemsList;
            let filterIds, filter;
            if (filterNames.length >= 1) {
                filterIds = filterNames.map(el => el.properties.id);
                filter = ['match', ['get', 'id'], filterIds, true, false];
            } else filter = ['==', 'Z','X']; //nonsense filter
            this.map.setFilter('locations', filter);
            this.map.setFilter('locations-text', filter);
        }


        let theMarker = this.theMarker
        if (prevProps.activePoint !== this.props.activePoint){

            if (prevProps.activePoint && this.props.activePoint) {
                theMarker.remove()
                theMarker.setLngLat(this.props.activePoint.geometry.coordinates)
                theMarker.addTo(this.map)
            }
            else if (prevProps.activePoint)
                theMarker.remove()
            else
                theMarker.setLngLat(this.props.activePoint.geometry.coordinates).addTo(this.map)
        }

        if (
            this.props.zoomValue !== prevProps.zoomValue &&
            this.props.zoomValue !== this.map.getZoom()
        ) {
            this.map.zoomTo(this.props.zoomValue, {center: [37.623597, 55.751583]})
        }
    }

    initMap () {
        if (this.initialized) {
            return;
        }
        const geojsonPoints = this.props.pointsData;
        const geojsonConturs = this.props.contursData; //наверное иы контуры не будем показывать

        if (!geojsonPoints || !geojsonConturs) {
            return;
        }

        if (this.map.loaded()) { //https://github.com/mapbox/mapbox-gl-js/issues/6707#issue-325222553
            //debugger
            this.processDrawing()
        } else {
            //debugger
            this.map.on('load', () => this.processDrawing())
        }

    }
    processDrawing () {
        if (this.initialized) {
            return;
        }
        const geojsonPoints = this.props.pointsData;

            this.map.addLayer({
                id: 'locations',
                type: 'circle',
                source: geojsonPoints,
                'paint': {
                    'circle-radius': {
                        'base': 3,
                        'stops': [[10, 10], [14, 10]]
                    },
                    'circle-color':  ['get','color'],
                    'circle-opacity': {
                        'base': 3,
                        'stops': [[10, 0.3], [12, 1]]
                    },
                    'circle-stroke-width': 0,
                    'circle-stroke-color': '#00bf7c',
                    'circle-stroke-opacity': 1,
                },
            });
        /*this.map.addLayer({        // This is CUPS
            id: 'locations',
            type: 'symbol',
            source: geojsonPoints,
            layout: {
                'text-field': 'a',
                'text-font': ['untitled-font-1 font-1'],
                'text-anchor': 'top',
                'text-size': 20,
                'text-allow-overlap': true,
                'text-ignore-placement' :true,
                'symbol-sort-key':['get','rating'],
                'text-offset': [0, -0.2],
            },
            paint: {
                'text-translate-anchor': 'viewport',
                'text-color':['get','color'],
                'text-opacity': {
                    'base': 3,
                    'stops': [[10, 0.3], [12, 1]]
                },
            }
        });*/
            this.map.addLayer({
                id: 'locations-text',
                type: 'symbol',
                source: geojsonPoints,
                layout: {
                    'icon-image': 'none',
                    'text-field': ['get', 'title'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 0.8],
                    'text-anchor': 'top',
                    'text-size': {
                        'stops': [
                            [14, 0],
                            [14.001, 12]
                        ]
                    },
                    'icon-allow-overlap': true,
                    'text-allow-overlap': false,
                    'visibility': 'visible'
                }
            });

        this.map.on('click', 'locations', (e) => {
            const currentFeature = e.features[0];
            this.props.selectedPoint(currentFeature)
        });

        this.map.on('mouseover', 'locations', (e) => {
            if (e.features.length > 0) {
                this.props.onHighlightedCafeChange(e.features[0].properties.id)
            }
        });
        this.map.on('mouseleave', 'locations', () => {
            this.props.onHighlightedCafeChange(null);
        });

        /*this.map.on('load', () => {         // хороплет
            this.map.addSource('cafeRating', {
                'type': 'geojson',
                'data': geojsonConturs
            });

            this.map.addLayer({
                'id': 'cafeRating',
                'source': 'cafeRating',
                'type': 'fill',
                'maxzoom': this.zoomThreshold,
                'paint': {
                    'fill-color': ['get','color'],
                    'fill-opacity': 0,
                    'fill-outline-color': '#000'
                }
            }, 'waterway-label');
        });*/
        /*this.map.on('click', 'cafeRating', (e) => {
            const coordinates = e.features[0].geometry.coordinates[0]
            const bounds = coordinates.reduce(function (bounds, coord) {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            this.map.flyTo({
                center: bounds.getCenter(),
                zoom: 13
            });
        });*/

        this.map.on('moveend', () => {
            this.props.onZoomValueChange(this.map.getZoom());
            this.props.updateBounds(this.map.getBounds());
        });

        this.initialized = true;
    }


    //Change language of label layers
    translateMap () {
        mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js');
        this.map.addControl(new MapboxLanguage({
            defaultLanguage: 'ru'
        }));
    }

    render() {
        return <div id="map"></div>
    }
}

export default Map;
