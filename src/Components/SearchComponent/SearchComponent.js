import React, { useState } from 'react';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    // Handle your search logic here
    console.log(`Searching for: ${searchTerm}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <input type="submit" value="Search" />
    </form>
  );
}

export default SearchComponent;
