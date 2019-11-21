import React, {Component} from 'react';
import ReactDOM from "react-dom";
import closeBtn from './img/close.svg'

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
        this.info = this.props.all.find( el => el['Id карточки'] === this.props.target.properties.rawId)
    }

    render() {
        const fullInfo = this.state.info,
            info = this.props.target.properties
        return ReactDOM.createPortal(
            <div className="cafeCard cafeCard-absolute">
                <div className='cafeCard--header'>{fullInfo['Наименование организации']}</div>
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
                <div>{info['FlampRating']}</div>
            </div>,
        document.getElementById('cafeCard'));
    }
}

export default CafeCard;
