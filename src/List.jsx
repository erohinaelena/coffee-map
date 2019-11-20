import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Search from './Filters/Search.jsx'
import FilterEcoFriendly from './Filters/FilterEcoFriendly.jsx'
import FilterOpenNow from './Filters/FilterOpenNow.jsx'
import FilterAverageCheck from './Filters/FilterAverageCheck.jsx'
import lodash from 'lodash';

class List extends Component {
    state = {
        searchText: '',
        isEcoChecked: false,
        isOpenNowChecked: false,
        averageCheckBounds: [-Infinity, +Infinity],
        linesOfList: [],
        clicked: false
    };

    componentDidUpdate(prevProps) {
        if (
            !lodash.isEqual(this.props.mapBounds, prevProps.mapBounds) ||
            !prevProps.rawPoints && this.props.rawPoints
        ) {
            this.updateLinesOfList();
        }
        else('nothing to update')

    }

    getLinesOfList() {
        const {rawPoints, mapBounds} = this.props;
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        const searchedText = this.state.searchText.toLowerCase();
        const {isEcoChecked, isOpenNowChecked, averageCheckBounds} = this.state;

        const today = new Date();
        const weekDay = today.getDay();
        const currentTimeStr = `${today.getHours()}:${today.getMinutes()}`;

        return (rawPoints && rawPoints.data && rawPoints.data.features || [])
            .filter(({geometry, properties}) => {
                // Фильтруем по видимой области
                const [lng, lat] = geometry.coordinates;
                if (!(sw.lng < lng && lng < ne.lng && sw.lat < lat && lat < ne.lat)){
                    return false;
                }
                // Потом по тексту, если что-то введено в поиск
                if (searchedText) {
                    const cafeName = properties.title.toLowerCase();
                    const cafeDesc = properties.description.toLowerCase();
                    if (!cafeName.includes(searchedText) && !cafeDesc.includes(searchedText)) {
                        return false;
                    }
                }
                // Потом по фильтру 'Открыто сейчас'
                if (isOpenNowChecked) {
                    const workTime = properties.workTime;
                    const workingPeriods = workTime[weekDay - 1];
                    const isWorkingNow = workingPeriods.some(([from, to]) =>
                        to < from && currentTimeStr <= to ||
                        from <= currentTimeStr && currentTimeStr <= to
                    );
                    if (!isWorkingNow) {
                        return false;
                    }
                }
                // + должна быть проверка на эко-френдли и цену
                return true;
            })
            .sort((a,b) => b.properties.rating - a.properties.rating);
    }

    updateLinesOfList () {
        const linesOfList = this.getLinesOfList();
        this.setState({linesOfList});
        this.props.onFilteredItemsChange(linesOfList)
    }

    onSearchTextChange = (e) => {
        const searchText = e.target.value;
        this.setState(
            {searchText},
            this.updateLinesOfList
        )
    };

    onEcoFilterToggle = () => {
        this.setState(
            ({isEcoChecked}) => ({isEcoChecked: !isEcoChecked}),
            this.updateLinesOfList
        );
    };

    onOpenNowFilterToggle = () => {
        this.setState(
            ({isOpenNowChecked}) => ({isOpenNowChecked: !isOpenNowChecked}),
            this.updateLinesOfList
        );
    };

    onAverageCheckBoundsChange = (averageCheckBounds) => {
        this.setState(
            {averageCheckBounds},
            this.updateLinesOfList
        );
    };

    handleClick = (number) => {
        this.props.activeItem(number)
        this.props.currentItem(number)
        //this.setState({clicked: true, activeItem: number});
        //this.onSearchTextChange(number.properties.title)
    };
/*
    handleClose = () => {
        this.setState({clicked: false});
        this.onSearchTextChange("")
    }*/

    render() {
        const {
            linesOfList,
            isEcoChecked,
            isOpenNowChecked,
            averageCheckBounds
        } = this.state;

        return ReactDOM.createPortal(
            <div className={'sidebar'}>
                {this.state.clicked ?
                    '1':
                    <div className={'sidebar'}>
                        <Search onSearchTextChange={this.onSearchTextChange}/>
                        <div className={'filters'}>
                        <FilterEcoFriendly
                            isChecked={isEcoChecked}
                            onToggle={this.onEcoFilterToggle}
                        />
                        <FilterOpenNow
                            isChecked={isOpenNowChecked}
                            onToggle={this.onOpenNowFilterToggle}
                        />
                        </div>
                        {/*<FilterAverageCheck
                            averageCheckBounds={averageCheckBounds}
                            onAverageCheckBoundsChange={this.onAverageCheckBoundsChange}
                        />*/}
                        <ul className={'scrollable'}>
                            {linesOfList.map((number, i) =>
                                <li
                                    style={{color : number.properties.color}}
                                    className={'listItem'}
                                    key={i}
                                    id={`cafeListItem_${number.properties.id}`}
                                    onClick={() => this.handleClick(number) }
                                    onMouseOver={() => this.props.onHighlightedCafeChange(number.properties.id)}
                                    onMouseLeave={() => this.props.onHighlightedCafeChange(null)}
                                >
                                    {number.properties.title}
                                </li>
                            )}
                        </ul>
                    </div>
                }
            </div>,
            document.getElementById('cafeList')
        );
    }
}

export default List;
