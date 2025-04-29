import React, { useState } from 'react';
import UploadForm from './UploadForm';

const Sidebar = ({ activeTab, setActiveTab }) => {
  // State for upload sections expanded status
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="w-64 h-full bg-gray-800 flex flex-col border-r border-gray-700 overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6">
        <h1 className="text-4xl font-bold tracking-tight text-white">STAKE READER</h1>
      </div>
      
      {/* Navigation Tabs */}
      <div className="mb-8 px-6">
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center w-full py-3 px-4 text-left ${
              activeTab === 'stats' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span className="font-medium">STATS</span>
          </button>
          <button 
            onClick={() => setActiveTab('slots')}
            className={`flex items-center w-full py-3 px-4 text-left ${
              activeTab === 'slots' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
            </svg>
            <span className="font-medium">SLOTS</span>
          </button>
          <button 
            onClick={() => setActiveTab('sports')}
            className={`flex items-center w-full py-3 px-4 text-left ${
              activeTab === 'sports' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span className="font-medium">SPORTS</span>
          </button>
        </div>
      </div>
      
      {/* Upload Sections */}
      <div className="px-6 flex-1">
        <h2 className="text-lg font-medium text-blue-300 mb-4">Upload Data Files</h2>
        
        {/* Deposits Section */}
        <div className="mb-4">
          <div 
            className="flex justify-between items-center bg-gray-700 hover:bg-gray-600 rounded-t-lg px-4 py-3 cursor-pointer"
            onClick={() => toggleSection('deposits')}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span className="font-medium">DEPOSITS</span>
            </div>
            <span className={`transform transition-transform ${expandedSection === 'deposits' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSection === 'deposits' && (
            <div className="bg-gray-700 rounded-b-lg p-3">
              <UploadForm uploadType="transactions" fileType="deposit" />
            </div>
          )}
        </div>
        
        {/* Withdrawals Section */}
        <div className="mb-4">
          <div 
            className="flex justify-between items-center bg-gray-700 hover:bg-gray-600 rounded-t-lg px-4 py-3 cursor-pointer"
            onClick={() => toggleSection('withdrawals')}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-medium">WITHDRAWALS</span>
            </div>
            <span className={`transform transition-transform ${expandedSection === 'withdrawals' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSection === 'withdrawals' && (
            <div className="bg-gray-700 rounded-b-lg p-3">
              <UploadForm uploadType="transactions" fileType="withdraw" />
            </div>
          )}
        </div>
        
        {/* Bet Archive Section */}
        <div className="mb-4">
          <div 
            className="flex justify-between items-center bg-gray-700 hover:bg-gray-600 rounded-t-lg px-4 py-3 cursor-pointer"
            onClick={() => toggleSection('betArchive')}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium">BET ARCHIVE</span>
            </div>
            <span className={`transform transition-transform ${expandedSection === 'betArchive' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSection === 'betArchive' && (
            <div className="bg-gray-700 rounded-b-lg p-3">
              <UploadForm uploadType="bets" />
            </div>
          )}
        </div>
      </div>
      
      {/* Process Button - We can remove this since UploadForm has its own submit buttons */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-500 mt-2">
          Upload Stake.com JSON files to analyze your betting history and track your performance over time.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;