import React from 'react';

const ResetFiltersPopup = ({
   isEcoChecked,
   isOpenNowChecked,
   searchText,
   isZoomed,
   resetZoomValue,
   resetFilters
}) => {
	const filtersToggled = isEcoChecked || isOpenNowChecked || searchText;
	return (
		<div className={'resetPopupContainer'}>
			<div className={'resetPopup'}>
				<div className={'resetPopup_title'}>{'Ничего не нашлось'}</div>
				{`В этом месте нет ${isEcoChecked ? 'эко-кафе' : 'кафе'}${isEcoChecked && searchText.length > 0 ? ',' : ''}${searchText.length > 0 ? ` c "${searchText}" в названии или адресе.` : '.'}`}
				{isOpenNowChecked ? ' По крайней мере таких, которые открыты прямо сейчас.' : '' }
				<br/>
				<br/>
				{'Попробуйте '}
				{isZoomed && (<button onClick={resetZoomValue}>{'искать по всей Москве'}</button>)}
				{isZoomed && filtersToggled ? ' или ' : ''}
				{filtersToggled && (<button onClick={resetFilters}>{'сбросить фильтры'}</button>)}
			</div>
		</div>
	)
};

export default ResetFiltersPopup;
