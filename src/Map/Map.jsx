import React, {Component} from 'react'
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language'

mapboxgl.accessToken = 'pk.eyJ1IjoiZXJvaGluYWVsZW5hIiwiYSI6InNWVFJmZFUifQ.ZjRE101FtM3fXPJiw2Fq9g';

class Map extends Component {
    componentDidMount() {
        const bounds = [
            [36.7839, 55.134], // Southwest coordinates
            [38.0038, 56.0559]  // Northeast coordinates
        ];
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v9',
            center: [37.617635, 55.755814],
            minZoom: 9,
            maxBounds: bounds,
            //doubleClickZoom: false,
        });

        this.translate(map);
        this.map = map;
        this.zoomThreshold = 11;
        this.props.updateBounds(this.map.getBounds());
    }

    componentDidUpdate(prevProps) {
        //do it once
        if (
            !prevProps.pointsData && this.props.pointsData &&
            !prevProps.contursData && this.props.contursData // их не было и вот они есть, первый и единственнный раз
        ) {
            const geojsonPoints = this.props.pointsData;
            const geojsonConturs = this.props.contursData;

            if (geojsonPoints) {
                //console.log('geojson^ ', geojsonPoints)

                this.map.on('load', () => {
                    // Add the data to your map as a layer
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
                });

                this.map.on('click', 'locations', (e) => {
                    const currentFeature = e.features[0];
                    debugger
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
            }

            if (geojsonConturs) {
                this.map.on('load', () => {
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
                });
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
            }

            this.map.on('moveend', () => {
                this.props.zoomValue(this.map.getZoom());
                this.props.updateBounds(this.map.getBounds());
            });

        }

        if (this.map.getLayer('locations')) {
            const filterNames = this.props.filteredItemsList;
            if (filterNames.length>1) {
                const filterIds = filterNames.map(el => el.properties.id);

                const filter = ['match', ['get', 'id'], filterIds, true, false];
                this.map.setFilter('locations', filter);
                this.map.setFilter('locations-text', filter);
            }
        }
    }

    //Change language of label layers
    translate(mapa) {
        mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js');
        mapa.addControl(new MapboxLanguage({
            defaultLanguage: 'ru'
        }));
    }

    render() {
        return (<div id='map'/>)
    }
}

export default Map;
