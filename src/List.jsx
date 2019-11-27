import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Search from './Filters/Search.jsx'
import FilterEcoFriendly from './Filters/FilterEcoFriendly.jsx'
import FilterOpenNow from './Filters/FilterOpenNow.jsx'
import lodash from 'lodash';

class List extends Component {
    state = {
        searchText: '',
        isEcoChecked: false,
        isOpenNowChecked: false,
        linesByFilters: null,
        linesByMap: null,
        linesOfList: [],
        clicked: false
    };

    componentDidUpdate(prevProps) {
        const {rawPoints} = this.props;
        if (rawPoints && rawPoints.data && rawPoints.data.features && !this.state.linesByFilters) {
            this.setState({
                linesByFilters: rawPoints.data.features,
                linesByMap: rawPoints.data.features,
                linesOfList: rawPoints.data.features
            }, this.updateLinesByMap);
        }
        if (
            this.state.linesByFilters &&
            !lodash.isEqual(this.props.mapBounds, prevProps.mapBounds)
        ) {
            this.updateLinesByMap();
        }
    }

    getLinesByFilters = () => {
        const {rawPoints} = this.props;
        const searchedText = this.state.searchText.toLowerCase().replace('ё','е');
        const {isEcoChecked, isOpenNowChecked} = this.state;

        const today = new Date();
        const weekDay = today.getDay();
        const formatTime = (item) => item < 10 ? `0${item}`: item;
        const currentTimeStr = `${formatTime(today.getHours())}:${formatTime(today.getMinutes())}`;

        return (rawPoints && rawPoints.data && rawPoints.data.features || [])
            .filter(({geometry, properties}) => {
                // Потом по тексту, если что-то введено в поиск
                if (searchedText) {
                    const cafeName = properties.title.toLowerCase().replace('ё','е');
                    const cafeDesc = properties.description.toLowerCase().replace('ё','е');
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
                // + должна быть проверка на эко-френдли
                if (isEcoChecked){
                    const eco = properties.eco;
                    if (!eco){
                        return false;
                    }
                }
                return true;
            })
            .sort((a,b) => b.properties.rating - a.properties.rating);
    };

    getLinesByMap = () => {
        const {rawPoints, mapBounds} = this.props;
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();

        return (rawPoints && rawPoints.data && rawPoints.data.features || [])
            .filter(({geometry, properties}) => {
                // Фильтруем по видимой области
                const [lng, lat] = geometry.coordinates;
                if (!(sw.lng < lng && lng < ne.lng && sw.lat < lat && lat < ne.lat)){
                    return false;
                }
                return true;
            })
            .sort((a,b) => b.properties.rating - a.properties.rating);
    };

    updateLinesByFilters = () => {
        const linesByFilters = this.getLinesByFilters();
        this.setState(
            {linesByFilters},
            this.updateLinesOfList
        );

        this.props.onFilteredItemsChange(linesByFilters)
    };

    updateLinesByMap = () => {
        const linesByMap = this.getLinesByMap();
        this.setState(
            {linesByMap},
            this.updateLinesOfList
        );
    };

    updateLinesOfList () {
        const {linesByFilters, linesByMap} = this.state;
        this.setState({
            linesOfList: lodash.intersectionBy(
                linesByFilters, linesByMap, (a) => a.properties.id
            ).sort(
                (a, b) => b.properties.rating - a.properties.rating
            )
        });
    }

    onSearchTextChange = (e) => {
        const searchText = e.target.value;
        this.setState(
            {searchText},
            this.updateLinesByFilters
        )
    };

    onEcoFilterToggle = () => {
        this.setState(
            ({isEcoChecked}) => ({isEcoChecked: !isEcoChecked}),
            this.updateLinesByFilters
        );
    };

    onOpenNowFilterToggle = () => {
        this.setState(
            ({isOpenNowChecked}) => ({isOpenNowChecked: !isOpenNowChecked}),
            this.updateLinesByFilters
        );
    };

    resetFilters = () => {
        this.setState({
            isOpenNowChecked: false,
            isEcoChecked: false,
            searchText: ''
        }, this.updateLinesByFilters)
    };

    handleClick = (number) => {
        this.props.currentItem(number)
    };

    toggleHover = () =>{
        this.setState({hover: !this.state.hover})
    }


    render() {
        const {
            linesOfList,
            isEcoChecked,
            isOpenNowChecked,
            searchText
        } = this.state;
        const {isZoomed} = this.props;
        const filtersToggled = isEcoChecked || isOpenNowChecked || searchText;
        const needResetFilters =
            linesOfList.length === 0 &&
            (filtersToggled || isZoomed);

        return ReactDOM.createPortal(
            <div className={'sidebar'}>
                {needResetFilters && (
                    <div className={'resetPopupContainer'}>
                        <div className={'resetPopup'}>
                            <div className={'resetPopup_title'}>{'Ничего не нашлось'}</div>
                            {`В этом месте нет 
                            ${isEcoChecked ? 'эко-кафе' : 'кафе'} 
                            ${isEcoChecked && searchText.length > 0 ? ',' : ''}
                            ${searchText.length > 0 ? ` c "${searchText}" в названии или адресе` : ''}. `}
                            {isOpenNowChecked ? 'По крайней мере таких, которые открыты прямо сейчас.' : '' }
                            <br/>
                            <br/>
                            {'Попробуйте '}
                            {isZoomed && (<button onClick={this.props.resetZoomValue}>{'искать по всей Москве'}</button>)}
                            {isZoomed && filtersToggled ? ' или ' : ''}
                            {filtersToggled && (<button onClick={this.resetFilters}>{'сбросить фильтры'}</button>)}
                        </div>
                    </div>
                )}
                {this.state.clicked ?
                    '1':
                    <div className={'sidebar'}>

                        <div className={'filters'}>
                            <Search
                                onSearchTextChange={this.onSearchTextChange}
                                text={searchText}
                            />
                            <FilterOpenNow
                                isChecked={isOpenNowChecked}
                                onToggle={this.onOpenNowFilterToggle}
                            />
                            <FilterEcoFriendly
                                isChecked={isEcoChecked}
                                onToggle={this.onEcoFilterToggle}
                            />
                        </div>
                        <ul className={'scrollable'}>
                            {linesOfList.map((number, i) => {
                                    const style = {
                                        color: `${number.properties.color}`,
                                        '--mywar':`${number.properties.color}`
                                    };
                                    return <li
                                        style={style}
                                        className={'listItem cafeCard'}
                                        key={i}
                                        id={`cafeListItem_${number.properties.id}`}
                                        onClick={() => this.handleClick(number)}
                                        onMouseOver={() => this.props.onHighlightedCafeChange(number.properties.id)}
                                        onMouseLeave={() =>  this.props.onHighlightedCafeChange(null)}
                                    >

                                        <div className='cafeCard--header'>
                                            {number.properties.title}
                                            {number.properties.eco ? '\u00A0🌱' : null}
                                        </div>
                                        <div className='cafeCard--content'>
                                            {number.properties.rating ?
                                                <div className='cafeCard--rating'>
                                                    {number.properties.rating}
                                                </div> : null}
                                            <div className='cafeCard--address'>
                                                {number.properties.description}
                                            </div>
                                        </div>

                                    </li>
                                }
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
