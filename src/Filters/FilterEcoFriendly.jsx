import React from 'react';
import classNames from 'classnames';
import Eco from "../Eco";

const FilterEcoFriendly = ({isChecked, onToggle}) => (
	<div
		className={classNames(
			'filter',
			'filter-rounded',
			'filterEcoFriendly',
			{'__checked': isChecked}
		)}
		onClick={onToggle}
	>
		{'Эко'}<Eco />
	</div>
);

export default FilterEcoFriendly;
