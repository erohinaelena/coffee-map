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

const getColorMagma =  scaleSequential([3, 5], d => interpolateMagma(d/2+0.25)).clamp(true);

const isMobile = () => {
    if (window.screen && window.screen.availWidth < 600) {
        return true;
    }
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i).test(userAgent);
};
const IS_MOBILE = isMobile();


class MapContainer extends Component {
    state = {
        points: null,
        conturs: null,
        currentItem: null,
        highlightedItemId: null,
        filteredItems: [],
        rawData:[],
        rawDataMap:[],
        zoomValue: 9,
        mapBounds: null
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
        this.setState({currentItem: value})
    };

    filteredItemsHandler = (list) => {
        this.setState({filteredItems: list})
    };

    handleClose = () => {
        this.setState({currentItem: null});
        //this.searchHandler("")
    };

    zoomValueHandler = (value) => {
        this.setState({zoomValue: value});
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
                      filteredItemsList={this.state.filteredItems}
                      onHighlightedCafeChange={this.onHighlightedCafeChange}
                      mapBounds={this.state.mapBounds}
                />

                <Map pointsData={this.state.points}
                     contursData={this.state.conturs}
                     selectedPoint={this.selectedPointHandler}
                     filteredItemsList={this.state.filteredItems}
                     zoomValue={this.zoomValueHandler}
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
                coordinates: [+d['Longitude'], +d['Latitude']]
            },
            properties: {
                id: i,
                rawId: d['Id карточки'],
                title: d['Наименование организации'],
                description: d['Улица'] + ', ' + d['Номер дома'],
                rating: rating,
                color: (rating) ? getColorMagma(rating) : 'gray',
                workTime: parseWorkTime(d['Время работы'])
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
