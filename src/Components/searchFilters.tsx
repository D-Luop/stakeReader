import React from 'react';

const SearchFilters = ({ 
  searchTerm, 
  selectedProvider, 
  sortOption, 
  dateFilterEnabled, 
  startDate, 
  endDate, 
  onFilterChange 
}) => {
  // Provider options - in a real implementation, this would come from props/context
  const providers = [
    'All Providers', 
    'Pragmatic Play', 
    'Stake Originals', 
    'NoLimit City', 
    'Push Gaming', 
    'Hacksaw'
  ];

  // Sort options
  const sortOptions = [
    { value: 'profit-high', label: 'Highest Profit' },
    { value: 'profit-low', label: 'Lowest Profit' },
    { value: 'bets-high', label: 'Most Bets' },
    { value: 'bets-low', label: 'Fewest Bets' }
  ];

  // Handle search input clear
  const clearSearch = () => {
    onFilterChange('search', '');
  };

  // Handle reset all filters
  const resetFilters = () => {
    onFilterChange('reset');
  };

  return (
    <div className="flex items-center space-x-2 flex-wrap">
      {/* Search input */}
      <div className="relative flex-grow max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Search games..."
          className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={clearSearch}
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Provider dropdown */}
      <div className="relative">
        <select
          value={selectedProvider}
          onChange={(e) => onFilterChange('provider', e.target.value)}
          className="bg-gray-700 text-white rounded-lg pl-3 pr-8 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {providers.map(provider => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Sort dropdown */}
      <div className="relative">
        <select
          value={sortOption}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="bg-gray-700 text-white rounded-lg pl-3 pr-8 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Date filter button */}
      <button
        onClick={() => onFilterChange('dateEnabled', !dateFilterEnabled)}
        className={`flex items-center space-x-1 rounded-lg px-3 py-2 transition-colors ${
          dateFilterEnabled 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        <span>Date Range Filter</span>
      </button>
      
      {/* Date picker inputs - only show when date filter is enabled */}
      {dateFilterEnabled && (
        <>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </>
      )}
      
      {/* Reset filters button */}
      <button
        onClick={resetFilters}
        className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-2 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default SearchFilters;