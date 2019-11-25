import React, {Component} from 'react';
import ReactDOM from "react-dom";
import {interpolateMagma} from 'd3-scale-chromatic';
import {scaleSequential} from 'd3-scale';

const getColorMagma =  scaleSequential([3, 5], d => interpolateMagma(d/2+0.25)).clamp(true);

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

        /*ctx.fillStyle = 'white';
        ctx.font = "normal 16px 'Open Sans'";
        ctx.fillText("5★", 10, 15);
        ctx.fillText("4★", w/2-10, 15);
        ctx.fillText("3★", w-30, 15);

        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText("оценка 2gis", 30, 15);*/
        const label = document.createElement("DIV");
        label.textContent = name;
        label.style.position = "absolute";
        label.style.top = "4px";


    }


    render() {


        return ReactDOM.createPortal(
            <div>
            <canvas id="legend" height='25' />
                <div className='overlay'>
                    <div className='l1'>5★ <span>оценка 2gis</span></div>
                    <div className='l1'>4★</div>
                    <div className='l2'>3★</div>
                </div>
            </div>,
            document.getElementById('legenda'));
    }
}

export default Legend;