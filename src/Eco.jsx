import React, {Component} from 'react';
import img from './img/eco.png'

class Eco extends Component {
    render() {
        return (
            <span style={{'whiteSpace': 'nowrap'}}>&nbsp;<img src={img} width='17px' height='17px' alt='eco'
                                                              style={{
                                                                  'verticalAlign': '-3px',
                                                                  'height': '1em',
                                                                  'width': '1em'
                                                              }}/></span>
        );
    }
}
export default Eco;