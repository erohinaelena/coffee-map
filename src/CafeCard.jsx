import React, {Component} from 'react';
import ReactDOM from "react-dom";
import closeBtn from './img/close.svg'
import lodash, {isEqual} from 'lodash';
import {nest} from 'd3-collection';
import {mean} from "d3-array";

class CafeCard extends Component {
    constructor(props) {
        super(props);
        const fullInformation = this.props.all.find( el => el['Id карточки'] === this.props.target.properties.rawId)
        this.state = { info: fullInformation};
    }

    handleClose = () => {
        this.props.closeCard();
    }

    componentDidUpdate=(prevProps, prevState, snapshot)=> {
        if (!isEqual(this.props.target, prevProps.target)) {
            const full = this.props.all.find(el => el['Id карточки'] === this.props.target.properties.rawId)
            this.setState({info: full})
        }
    }

    render() {

        const fullInfo = this.state.info,
            info = this.props.target.properties
debugger
        const week=['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
        const workTime = Array.isArray(info.workTime) ? info.workTime : JSON.parse(info.workTime)
        const shedule = workTime.map((a,i)=>{return {day:i, time: a[0]}}).filter(el => el.time!=undefined)
        const shorts =  nest()
            .key(d=>d.time)
            .rollup(els => {
                if (els.length > 1)
                    return week[ els[0].day ]+"-"+week[ els[els.length-1].day ] //Пн-чт —
                else return week[ els[0].day ]
            })
            .entries(shedule);

        const short = shorts.map(el =>{

                const keys = el.key.split(','),
                    start = keys[0] || '',
                    end = keys[1] || '',
                    hours = start.split(':'),
                    startH = hours[0] || '',
                    startM = hours[1] || '',
                    hours2 = end.split(":"),
                    endH = hours2[0] || '',
                    endM = hours2[1] || ''
                return {
                    key: '<span>' + startH + '<sup>' + startM + '</sup> — ' + endH + '<sup>' + endM + '</sup></span>',
                    value: el.value
                }

        })


        return ReactDOM.createPortal(
            <div className="cafeCard cafeCard-absolute" style={{'background':info.color}}>
                <div className='cafeCard--header'>{info.title}</div>
                <div className='cafeCard--closeBtn' onClick = {this.handleClose}><img src={closeBtn} width="19" height="18" /></div>

                <div className='cafeCard--content'>
                    {info.rating ?
                        <div className='cafeCard--rating'>
                            {info.rating}
                        </div> :null}
                    <div className='cafeCard--address'>
                        {info.description}
                    </div>
                </div>
                <div className='cafeCard--content--shedule'>
                    {short.map((el, i) =>
                        <div key={i}  className='cafeCard--content--shedule--row'>
                            <div>{el.value}</div>
                            <div dangerouslySetInnerHTML={{__html: el.key}} />
                        </div>
                    )}
                </div>
                <div>
                    {fullInfo['Способ оплаты']=='Наличный расчёт' ? 'Оплата только наличными' : null}
                </div>
                <div>
                    {fullInfo['Телефоны']!="#ERROR!" ? fullInfo['Телефоны'] : null}
                </div>
                <div>{info['FlampRating']}</div>
            </div>,
        document.getElementById('cafeCard'));
    }
}

export default CafeCard;