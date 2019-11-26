import React, {Component} from 'react';
import ReactDOM from "react-dom";
import {interpolateMagma} from 'd3-scale-chromatic';
import {scaleSequential} from 'd3-scale';

const getColorMagma =  scaleSequential([3, 5], d => interpolateMagma(d/4+0.5)).clamp(true);

class Legend extends Component {
    componentDidMount() {
        const c = document.getElementById("legend");
        const ctx = c.getContext("2d");
        const w = c.offsetWidth-38
        const grd = ctx.createLinearGradient(0,0, w-100, c.offsetHeight);

        grd.addColorStop(0,getColorMagma(5));
        grd.addColorStop(0.25,getColorMagma(4.5));
        grd.addColorStop(0.5,getColorMagma(4));
        grd.addColorStop(0.75,getColorMagma(3.5));
        grd.addColorStop(1,getColorMagma(3));

        ctx.fillStyle = grd;
        ctx.fillRect(0,0, w, c.offsetHeight);
    }

    render() {

        return ReactDOM.createPortal(
            <div>
            <canvas id="legend" height='25' />
                <div className='overlay'>
                    <div>5★ <span>оценка 2gis</span></div>
                    <div>4★</div>
                    <div>3★</div>
                </div>
            </div>,
            document.getElementById('legenda'));
    }
}

export default Legend;