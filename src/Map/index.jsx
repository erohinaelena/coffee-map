import React, {Component} from 'react';
import {csv, json}  from 'd3-fetch';
import {interpolateMagma} from 'd3-scale-chromatic';
import {scaleSequential} from 'd3-scale';
import Map from './Map';
import List from '../List';
import data from '../data/data_test.csv'
import moscow from '../data/mo.geojson'
import CafeCard from "../CafeCard";

class MapContainer extends Component {
    state = {
        points: null,
        conturs: null,
        activeItem: null,
        currentItem: null,
        visiblePoints: null,
        filteredItemsList: [],
        rawData:[],
    };

    componentDidMount() {
        ///  GET DATA HERE
        // async await вроде не нужен
        csv(data).then((data) => {
            json(moscow).then((geoMoscow) => {
                const geoJSON = makeGeoJSON(data);
                addValues(geoMoscow);
                this.setState({
                    rawData: data,
                    points: geoJSON,
                    conturs: geoMoscow,
                    visiblePoints: geoJSON.data.features,
                    filteredItemsList: geoJSON.data.features
                })
            })

        });
    }

    visiblePointsHandler = (value) => {
        this.setState({visiblePoints: value})
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
    }


    render() {
        return (
            <div>
                {this.state.currentItem ?
                    <CafeCard target = {this.state.currentItem}
                              all = {this.state.rawData}
                              closeCard = {() => this.handleClose()}
                    /> : null}
                <List visiblePoints={this.state.visiblePoints}
                      activeItem={this.activeItemHandler} // to fly on map, it will be null after flight
                      currentItem={this.currentItemHandler} // to open card
                      filteredItems={this.filteredItemsHandler}
                      filteredItemsList={this.state.filteredItems}/>

                <Map pointsData={this.state.points}
                     contursData={this.state.conturs}
                     visiblePoints={this.visiblePointsHandler}
                     activeItem={this.state.activeItem}
                     clearActiveItem={this.clearActiveItemHandler}
                     filteredItemsList={this.state.filteredItems}/>
            </div>
        );
    }
}

function makeGeoJSON(data) {
    const features = data.map((d, i) => {
        let rating = +d['FlampRating'].replace(',', '.') || 0
        let x = scaleSequential([3, 5], interpolateMagma);
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
                color: (rating) ? x(rating) : 'gray',
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

function addValues(data) {
    data.features.forEach(feature => {
        feature.properties.value = +(Math.random() * 100).toFixed(2)
    })

}

export default MapContainer;