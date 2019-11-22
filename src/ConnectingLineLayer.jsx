import React, {Component} from 'react';

class ConnectingLineLayer extends Component {
	state = {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
		color: ''
	};

	componentDidUpdate (prevProps) {
		if (prevProps.highlightedItemId !== this.props.highlightedItemId) {
			this.calculateCoordinates();
		}
	}

	calculateCoordinates () {
		const {filteredItemsList, highlightedItemId, mapBounds} = this.props;
		if (!highlightedItemId) {
			this.clearLine();
			return;
		}
		const pointData = filteredItemsList.find(
			(item) => item.properties.id === highlightedItemId);
		if (!pointData || !pointData.geometry || !pointData.geometry.coordinates) {
			this.clearLine();
			return;
		}
		const coordinates = pointData.geometry.coordinates;
		const [pointLng, pointLat] = coordinates;
		const sw = mapBounds.getSouthWest();
		const ne = mapBounds.getNorthEast();
		const nw = mapBounds.getNorthWest();
		const mapWidthInLng = ne.lng - sw.lng;
		const mapHeightInLat = ne.lat - sw.lat;
		const mapBBox = document.getElementById('map').getBoundingClientRect();
		const listItemBBox = document.getElementById(`cafeListItem_${pointData.properties.id}`).getBoundingClientRect();
		const xPosition = (pointLng - nw.lng) / mapWidthInLng * mapBBox.width;
		const yPosition = (nw.lat - pointLat) / mapHeightInLat * mapBBox.height;
		this.setState({
			x1: xPosition + mapBBox.x,
			y1: yPosition + mapBBox.y,
			x2: listItemBBox.x + listItemBBox.width,
			y2: listItemBBox.y + listItemBBox.height / 2,
			color: pointData.properties.color
		})
	}

	clearLine () {
		this.setState({
			x1: 0,
			y1: 0,
			x2: 0,
			y2: 0
		})
	}

	render () {
		const {x1, x2, y1, y2, color} = this.state;
		return (
			<svg className="connectingLineLayerSvg">
				<line
					stroke={color}
					strokeWidth="0.5"
					x1={x1}
					y1={y1}
					x2={x2}
					y2={y2}
				/>
			</svg>
		)
	}
}

export default ConnectingLineLayer;
