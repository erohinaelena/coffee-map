import React, {Component} from 'react'
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import {getColorMagma} from './';

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
            minZoom: 10,
            //maxBounds: bounds,
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
                                'stops': [[10, 2], [14, 10]]
                            },
                            'circle-color':  ['get','color'],
                            //'circle-opacity': 1,
                            'circle-opacity': {
                                'base': 3,
                                'stops': [[10, 0.8], [12, 1]]
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
                            'text-offset': [0, 0.6],
                            'text-anchor': 'top',
                            'text-size': {
                                'stops': [
                                    [0, 0],
                                    [14, 0],
                                    [14.1, 16],
                                    [15, 20]
                                ]
                            },
                            'icon-allow-overlap': true,
                            'text-allow-overlap': false,
                            'visibility': 'visible'
                        }
                    });

                    this.map.addLayer({
                        "id": "heatmap3",
                        "type": "heatmap",
                        "source": geojsonPoints,
                        "paint": {
                            "heatmap-weight": [
                                "interpolate", ["exponential", 10000], ["get", "rating"],
                                0, 0,
                                1, 0,
                                2, 1,
                                4, 0,
                                5, 0
                            ],
                            "heatmap-intensity": [
                                "interpolate", ["linear"], ["zoom"],
                                0, 1
                            ],
                            "heatmap-color": [
                                "interpolate", ["linear"], ["heatmap-density"],
                                0, 'rgba(0,0,0,0)',
                                1, getColorMagma(3)
                            ],
                            "heatmap-radius": [
                                "interpolate", ["linear"], ["get", "rating"],
                                1, 50
                            ],
                            "heatmap-opacity": [
                                "interpolate", ["linear"], ["zoom"],
                                10, 0.4,
                                14, 0
                            ],
                        }
                    }, 'waterway-label');


									
                    this.map.addLayer({
                        "id": "heatmap4",
                        "type": "heatmap",
                        "source": geojsonPoints,
                        "paint": {
                            "heatmap-weight": [
                                "interpolate", ["exponential", 10000], ["get", "rating"],
                                1, 0,
                                2, 0,
                                4, 1,
                                5, 0
                            ],
                            "heatmap-intensity": [
                                "interpolate", ["linear"], ["zoom"],
                                0, 1
                            ],
                            "heatmap-color": [
                                "interpolate", ["linear"], ["heatmap-density"],
                                0, 'rgba(0,0,0,0)',
                                1, getColorMagma(4)
                            ],
                            "heatmap-radius": [
                                "interpolate", ["linear"], ["get", "rating"],
                                1, 40
                            ],
                            "heatmap-opacity": [
                                "interpolate", ["linear"], ["zoom"],
                                10, 0.4,
                                14, 0
                            ],
                        }
                    }, 'waterway-label');



									
                    this.map.addLayer({
                        "id": "heatmap5",
                        "type": "heatmap",
                        "source": geojsonPoints,
                        "paint": {
                            "heatmap-weight": [
                                "interpolate", ["exponential", 10000], ["get", "rating"],
                                0, 0,
                                2, 0,
                                4, 0,
                                5, 1
                            ],
                            "heatmap-intensity": [
                                "interpolate", ["linear"], ["zoom"],
                                0, 1
                            ],
                            "heatmap-color": [
                                "interpolate", ["linear"], ["heatmap-density"],
                                0, 'rgba(0,0,0,0)',
                                1, getColorMagma(5)
                            ],
                            "heatmap-radius": [
                                "interpolate", ["linear"], ["get", "rating"],
                                1, 30
                            ],
                            "heatmap-opacity": [
                                "interpolate", ["linear"], ["zoom"],
                                10, 0.4,
                                14, 0
                            ],
                        }
                    }, 'waterway-label');




//                     this.map.addLayer({
//                         "id": "heatmap",
//                         "type": "heatmap",
//                         "source": geojsonPoints,
//                         "paint": {
// // Increase the heatmap weight based on frequency and property magnitude
//                             "heatmap-weight": [
//                                 "interpolate", ["linear"], ["get", "rating"],
//                                 0, 0,
//                                 2.9, 0,
//                                 3, -0.5,
//                                 5, 1
//                             ],
// // Increase the heatmap color weight weight by zoom level
// // heatmap-intensity is a multiplier on top of heatmap-weight
//                             "heatmap-intensity": [
//                                 "interpolate", ["linear"], ["zoom"],
//                                 0, 1,
//                                 14, 14
//                             ],
// // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
// // Begin color ramp at 0-stop with a 0-transparancy color
// // to create a blur-like effect.
//                             "heatmap-color": [
//                                 "interpolate", ["linear"], ["heatmap-density"],
//                                 0.2, 'rgba(0,0,0,0)',
//                                 0.3, getColorMagma(3),
//                                 0.5, getColorMagma(4),
//                                 1, getColorMagma(5)
//                             ],
// // Adjust the heatmap radius by zoom level
//                             "heatmap-radius": [
//                                 "interpolate", ["linear"], ["zoom"],
//                                 1, 0,
//                                 14, 40
//                             ],
// // Transition from heatmap to circle layer by zoom level
//                             "heatmap-opacity": [
//                                 "interpolate", ["linear"], ["zoom"],
//                                 7, 1,
//                                 14, 0.5
//                             ],
//                         }
//                     }, 'waterway-label');
                });


                this.map.on('click', 'locations', (e) => {
                    const currentFeature = e.features[0];
                    this.map.flyTo({
                        center: currentFeature.geometry.coordinates,
                        zoom: 15
                    });
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

            if (false) {
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
                this.map.on('click', 'cafeRating', (e) => {
                    const coordinates = e.features[0].geometry.coordinates[0]
                    const bounds = coordinates.reduce(function (bounds, coord) {
                        return bounds.extend(coord);
                    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
                    this.map.flyTo({
                        center: bounds.getCenter(),
                        zoom: 13
                    });
                });
            }
            createCafePopUp(this.map);

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

        if (this.props.activeItem) {
            this.map.flyTo({
                center: this.props.activeItem.geometry.coordinates,
                speed: 3,
                zoom: 15
            });

            this.props.clearActiveItem()
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

function createCafePopUp(map) {

    let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'locations', function (e) {

        let coordinates = e.features[0].geometry.coordinates.slice();
        let description = e.features[0].properties.description;
        let title = e.features[0].properties.title;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates)
            .setHTML(title + '<br>' +description)
            .addTo(map);
    });

    map.on('mouseleave', 'locations', function () {
        popup.remove();
    });
}
