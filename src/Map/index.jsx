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

export const getColorMagma =  scaleSequential([3, 5], d => interpolateMagma(d/2+0.25)).clamp(true);

class MapContainer extends Component {
    state = {
        points: null,
        conturs: null,
        activeItem: null,
        currentItem: null,
        highlightedItemId: null,
        filteredItemsList: [],
        rawData:[],
        zoomValue: 9,
        mapBounds: null
    };

    componentDidMount() {
        ///  GET DATA HERE
        // async await вроде не нужен
        csv(data).then((data) => {
            json(moscow).then((geoMoscow) => {

                const geoJSON = makeGeoJSON(data);

                const regionRating =  nest()
                    .key(d=>d['Район города'])
                    .rollup(els => mean(els, d => (+d['FlampRating'].replace(',', '.') || NaN)))
                    .entries(data);
                addValues(geoMoscow, regionRating);

                this.setState({
                    rawData: data,
                    points: geoJSON,
                    conturs: geoMoscow,
                    filteredItemsList: geoJSON.data.features
                })
            })

        });
    }

    selectedPointHandler = (value) => {
        this.setState({currentItem: value})
    };

    activeItemHandler = (value) => {
        this.setState({activeItem: value})
    };

    currentItemHandler = (value) => {
        this.setState({currentItem: value})
    };

    clearActiveItemHandler = () =>{
        this.setState({activeItem: null})
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
                {this.state.currentItem ?
                    <CafeCard target = {this.state.currentItem}
                              all = {this.state.rawData}
                              closeCard = {() => this.handleClose()}
                    /> : null}

                {this.state.zoomValue < 8 ?
                    <BarCharts
                    /> : null}

                <List rawPoints={this.state.points}
                      activeItem={this.activeItemHandler} // to fly on map, it will be null after flight
                      currentItem={this.currentItemHandler} // to open card
                      onFilteredItemsChange={this.filteredItemsHandler}
                      filteredItemsList={this.state.filteredItems}
                      onHighlightedCafeChange={this.onHighlightedCafeChange}
                      mapBounds={this.state.mapBounds}
                />

                <Map pointsData={this.state.points}
                     contursData={this.state.conturs}
                     activeItem={this.state.activeItem}
                     selectedPoint={this.selectedPointHandler}
                     clearActiveItem={this.clearActiveItemHandler}
                     filteredItemsList={this.state.filteredItems}
                     zoomValue={this.zoomValueHandler}
                     updateBounds={this.onBoundsUpdate}
                     onHighlightedCafeChange={this.onHighlightedCafeChange}
                />

                <ConnectingLineLayer
                    mapBounds={this.state.mapBounds}
                    highlightedItemId={this.state.highlightedItemId}
                    filteredItemsList={this.state.filteredItems}
                />

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
