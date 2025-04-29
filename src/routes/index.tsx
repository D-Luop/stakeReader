import React, { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as RootRoute } from './__root'
import Sidebar from '../Components/sidebar';
import SlotsView from '../Components/slotsView';
import SportsView from '../Components/sportsView';
import StatsView from '../Components/statsView';
import SearchFilters from '../Components/searchFilters';
import Graph from '../Components/graph';

// Main App Component
const HomePage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('stats'); // Default to 'slots'
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const [sortOption, setSortOption] = useState('profit-high');
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Handle filter changes
  const handleFilterChange = (filterType: any, value: any) => {
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'provider':
        setSelectedProvider(value);
        break;
      case 'sort':
        setSortOption(value);
        break;
      case 'dateEnabled':
        setDateFilterEnabled(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'endDate':
        setEndDate(value);
        break;
      case 'reset':
        setSearchTerm('');
        setSelectedProvider('All Providers');
        setSortOption('profit-high');
        setDateFilterEnabled(false);
        setStartDate('');
        setEndDate('');
        break;
      default:
        break;
    }
  };

  // Render active view based on tab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'slots':
        return <SlotsView 
                 searchTerm={searchTerm}
                 selectedProvider={selectedProvider}
                 sortOption={sortOption}
                 dateFilterEnabled={dateFilterEnabled}
                 startDate={startDate}
                 endDate={endDate}
               />;
      case 'sports':
        return <SportsView 
                 searchTerm={searchTerm}
                 selectedProvider={selectedProvider}
                 sortOption={sortOption}
                 dateFilterEnabled={dateFilterEnabled}
                 startDate={startDate}
                 endDate={endDate}
               />;
      case 'stats':
        return <StatsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
  
        {/* Search/Filters - Only show for slots and sports */}
        {(activeTab === 'slots' || activeTab === 'sports') && (
          <div className="px-4 py-2">
            <SearchFilters 
              searchTerm={searchTerm}
              selectedProvider={selectedProvider}
              sortOption={sortOption}
              dateFilterEnabled={dateFilterEnabled}
              startDate={startDate}
              endDate={endDate}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}
        
        {/* Active View Content */}
        <div className="flex-1 overflow-auto p-4">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

// THIS IS THE IMPORTANT PART:
export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: HomePage,
});