import React from 'react';

const Search = ({onSearchTextChange, text}) => (
    <div className="searchbar">
        <input
            type="text"
            className="filter"
            placeholder="Найти по названию или адресу"
            onChange={onSearchTextChange}
            value={text}
        />
    </div>
);

export default Search;
