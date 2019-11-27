import React, {Component} from 'react';
import {csv, json}  from 'd3-fetch';
import {interpolateMagma} from 'd3-scale-chromatic';
import {scaleSequential} from 'd3-scale';
import {sum, mean} from 'd3-array';
import {nest} from 'd3-collection';
import Map from './Map';
import List from '../List';
import data from '../data/data_test.csv'
import moscow from '../data/mo.geojson'
import CafeCard from "../CafeCard";
import BarCharts from "../BarCharts";
import ConnectingLineLayer from '../ConnectingLineLayer';
import Legend from "../Legend";

const getColorMagma =  scaleSequential([3, 5], d => interpolateMagma(d/4+0.5)).clamp(true);

const isMobile = () => {
    if (window.screen && window.screen.availWidth < 600) {
        return true;
    }
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i).test(userAgent);
};
const IS_MOBILE = isMobile();
const DEFAULT_ZOOM = 9.7;
const MIN_ZOOM = 9;

class MapContainer extends Component {
    state = {
        points: null,
        conturs: null,
        currentItem: null,
        highlightedItemId: null,
        filteredItems: [],
        rawData:[],
        rawDataMap:[],
        zoomValue: DEFAULT_ZOOM,
        mapBounds: null,
        isCardClosed:true
    };

    async componentDidMount() {
        ///  GET DATA HERE
        const [
            csvData,
            geoMoscow
        ] = await Promise.all([
            csv(data),
            json(moscow)
        ]);
        const geoJSON = makeGeoJSON(csvData);
        const regionRating =  nest()
            .key(d=>d['Район города'])
            .rollup(els => mean(els, d => (+d['FlampRating'].replace(',', '.') || NaN)))
            .entries(csvData);
        addValues(geoMoscow, regionRating);

        this.setState({
            rawData: csvData,
            points: geoJSON,
            conturs: geoMoscow,
            filteredItems: geoJSON.data.features
        });
    }

    selectedPointHandler = (value) => {
        debugger
        this.setState({currentItem: value})
    };

    currentItemHandler = (value) => {
        this.setState({currentItem: value, isCardClosed: false})
    };

    filteredItemsHandler = (list) => {
        this.setState({filteredItems: list})
    };

    handleClose = () => {
        this.setState({currentItem: null, isCardClosed: true});
        //this.searchHandler("")
    };

    zoomValueHandler = (value) => {
        this.setState({zoomValue: value});
    };

    resetZoomValue = () => {
        this.setState({zoomValue: MIN_ZOOM});
    };

    onHighlightedCafeChange = (highlightedItemId) => {
        this.setState({highlightedItemId});
    };

    onBoundsUpdate = (mapBounds) => {
        this.setState({mapBounds});
    };

    render() {
        return (
            <div>
                <Legend />

                {this.state.currentItem ?
                    <CafeCard target = {this.state.currentItem}
                              all = {this.state.rawData}
                              closeCard = {() => this.handleClose()}
                    /> : null}

                {this.state.zoomValue < 8 ?
                    <BarCharts
                    /> : null}

                <List rawPoints={this.state.points}
                      currentItem={this.currentItemHandler} // to open card
                      onFilteredItemsChange={this.filteredItemsHandler}
                      onHighlightedCafeChange={this.onHighlightedCafeChange}
                      mapBounds={this.state.mapBounds}
                      resetZoomValue={this.resetZoomValue}
                      isZoomed={this.state.zoomValue > MIN_ZOOM}
                      isCardClosed = {this.state.isCardClosed}
                />

                <Map pointsData={this.state.points}
                     contursData={this.state.conturs}
                     selectedPoint={this.selectedPointHandler}
                     activePoint={this.state.currentItem}
                     filteredItemsList={this.state.filteredItems}
                     onZoomValueChange={this.zoomValueHandler}
                     zoomValue={this.state.zoomValue}
                     updateBounds={this.onBoundsUpdate}
                     onHighlightedCafeChange={this.onHighlightedCafeChange}
                />

                {!IS_MOBILE && (
                    <ConnectingLineLayer
                        mapBounds={this.state.mapBounds}
                        highlightedItemId={this.state.highlightedItemId}
                        filteredItemsList={this.state.filteredItems}
                    />
                )}
            </div>
        );
    }
}

const parseWorkTime = (rawData) => {
    const byDays = rawData.split('|');
    if (byDays.length < 7) {
        return new Array(7).fill([]);
    }
    return byDays.map((dayStr) => {
        const regExp = /(\d{1,2}:\d{2}) до (\d{1,2}:\d{2})/ig;
        const res = dayStr.match(regExp);
        if (!res) {
            return [];
        }
        return res.map((period) =>
                period.split(' до ').map(
                    (time) => {return time.length === 5 ? time : `0${time}`}
                )
            );
    })

};

function makeGeoJSON(data) {
    const features = data.map((d, i) => {
        let rating = +d['FlampRating'].replace(',', '.') || 0
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: d['Слиплось'] ? [+d['LongitudeRand'], +d['LatitudeRand']] : [+d['Longitude'], +d['Latitude']]
            },
            properties: {
                id: i,
                rawId: d['Id карточки'],
                title: d['Наименование организации'],
                description: d['Улица'] + ', ' + d['Номер дома'] + (d['Этаж'] ? ', ' + d['Этаж'] + '\u00A0этаж' : ''),
                rating: rating,
                color: (rating) ? getColorMagma(rating) : 'gray',
                workTime: parseWorkTime(d['Время работы']),
                eco: d['eco_info'] ? 1 : 0,
            }
        }
        }
    );

    const geoJSON = {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": features.sort((a,b)=>a.properties.rating-b.properties.rating),
        }
    };

    return geoJSON
}

function addValues(data ,rating) {
    data.features.forEach(feature => {
        const rate = rating.find(el => el.key === feature.properties.NAME)
        feature.properties.value = rate ? rate.value : undefined
        feature.properties.color = rate ? getColorMagma(rate.value) : 'gray'

    })
}

export default MapContainer;
