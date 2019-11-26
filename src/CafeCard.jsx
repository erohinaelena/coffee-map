import React, {Component} from 'react';
import ReactDOM from "react-dom";
import closeBtn from './img/close.svg'
import instBtn from './img/insta.svg'
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

        const week=['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
        const workTime = Array.isArray(info.workTime) ? info.workTime : JSON.parse(info.workTime)
        const shedule = workTime.map((oneDay,i)=>{
            const allPeriods = oneDay.map(timeParts => {
                const timePeriod = timeParts.map(time => time.replace(/(\d?\d?):(\d?\d?)/gi, '$1<sup>$2</sup>'))
                return timePeriod.join(' — ')  
            })
            return {day:i, time: allPeriods.join(', ')}
        })
            .filter(el => el.time!="")

        const shortShedule =  nest()
            .key(d=>d.time)
            .rollup(els => {
                if (els.length > 1)
                    return week[ els[0].day ]+"-"+week[ els[els.length-1].day ] //Пн-чт
                else return week[ els[0].day ]
            })
            .entries(shedule);

        return ReactDOM.createPortal(
            <div className="cafeCard cafeCard-absolute" style={{'background':info.color}}>
                <div className='cafeCard--header'>
                    {info.title}
                    {info.eco ? '\u00A0🌱' : null}
                </div>
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
                    {shortShedule.map((el, i) =>
                        <div key={i}  className='cafeCard--content--shedule--row'>
                            <div>{el.value}</div>
                            <div dangerouslySetInnerHTML={{__html: el.key}} />
                        </div>
                    )}
                </div>

                <div className='cafeCard--content--phones'>
                    {fullInfo['Телефоны']!="#ERROR!" ? fullInfo['Телефоны'] : null}
                </div>

                <div className='cafeCard--content--flex'>

                    {fullInfo['Сайты'] ?
                        <a className='cafeCard--content--website'
                            href={addHttp(fullInfo['Сайты'].match(/.*|/))}
                            target='_blank'>
                            Перейти на сайт
                         </a>
                        :null}

                    {fullInfo['Сайты']?
                        <a className='cafeCard--content--insta'
                           href={addHttp(fullInfo['Сайты'].match(/.*|/))}
                           target='_blank'>
                            <img alt='Go to Instagram' src={instBtn} width='14' height='15' />
                        </a>
                    :null}

                </div>

                <div>
                    {fullInfo['Способ оплаты']=='Наличный расчёт' ? 'Оплата только наличными' : null}
                </div>

            </div>,
        document.getElementById('cafeCard'));
    }
}

export default CafeCard;

function addHttp(url){
    if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
    }
    return url;
}