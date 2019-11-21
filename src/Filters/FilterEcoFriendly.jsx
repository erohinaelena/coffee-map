import React from 'react';
import classNames from 'classnames';

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
		{'Эко 🌱'}
	</div>
);

export default FilterEcoFriendly;
