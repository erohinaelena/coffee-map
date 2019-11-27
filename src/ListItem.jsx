import React, {Component} from 'react';
import Eco from "./Eco";


class ListItem extends Component {
    render() {
        const item = this.props.content
        const style = {
            color: `${item.properties.color}`,
            '--border-color':`${item.properties.color}`
        };
        return (
            <li className={(this.props.activeItem==item.properties.id && !this.props.isCardClosed) ? 'active listItem cafeCard' : 'listItem cafeCard'}
                id={`cafeListItem_${item.properties.id}`}
                style = {style}
                onClick = {this.props.onClick}
                onMouseOver = {this.props.onMouseOver}
                onMouseLeave = {this.props.onMouseLeave}
            >
                <div className='cafeCard--header'>
                    {item.properties.title}
                    {item.properties.eco ? <Eco /> : null}
                </div>
                <div className='cafeCard--content'>
                    {item.properties.rating ?
                        <div className='cafeCard--rating'>
                            {item.properties.rating}
                        </div> : null}
                    <div className='cafeCard--address'>
                        {item.properties.description}
                    </div>
                </div>
            </li>
        );
    }
}
export default ListItem;