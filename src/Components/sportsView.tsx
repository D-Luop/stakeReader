import React, { useState, useEffect } from 'react';

// Format currency
function formatCurrency(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate effective odds from multiple outcomes
function calculateParleyOdds(outcomes) {
  if (!outcomes || outcomes.length === 0) return 1;
  
  return outcomes.reduce((totalOdds, outcome) => {
    const odds = outcome.odds || 1;
    return totalOdds * odds;
  }, 1);
}

const SportsView = ({ 
  searchTerm, 
  selectedProvider, 
  sortOption, 
  dateFilterEnabled, 
  startDate, 
  endDate 
}) => {
  const [sportsBets, setSportsBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch bets from the API
    const fetchBets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bets');
        if (!response.ok) {
          throw new Error('Failed to fetch bets data');
        }
        
        const data = await response.json();
        
        // Filter only sports bets
        // Look for bets with type: 'sports' or data.type containing 'sport' or 'sportsbook'
        const filteredSportsBets = data.filter(bet => 
          bet.type === 'sports' || 
          (bet.data && 
            (bet.data.type === 'sportsbook' || 
             (bet.data.gameName && 
              (bet.data.gameName.toLowerCase().includes('sport') || 
               bet.data.gameName.toLowerCase().includes('sportsbook')))))
        ).map(bet => {
          // Initialize with basic data
          const processedBet = {
            id: bet.id,
            stake: bet.data.amount || 0,
            potentialWin: bet.data.payout || 0,
            date: new Date(bet.data.createdAt || bet.created_at || Date.now()).toISOString(),
            status: bet.data.status || 'unknown',
            provider: bet.data.provider || 'Stake',
            result: bet.data.payout > bet.data.amount ? 'Win' : 'Loss'
          };
          
          // Handle parlay/multiple bets
          if (bet.data.outcomes && bet.data.outcomes.length > 0) {
            // This is a bet with multiple outcomes (parlay)
            const uniqueFixtures = Array.from(new Set(bet.data.outcomes.map(o => o.fixtureId)));
            
            if (uniqueFixtures.length > 1) {
              // Multiple different fixtures - definitely a parlay
              processedBet.betType = `${uniqueFixtures.length}-Team Parlay`;
              processedBet.sport = 'Multiple Sports';
              processedBet.league = 'Multiple Leagues';
              processedBet.match = `${uniqueFixtures.length}-Team Parlay`;
            } else {
              // Single fixture - could be a prop bet or something else
              processedBet.betType = 'Match Bet';
              processedBet.sport = 'Sports';
              processedBet.league = 'League';
              processedBet.match = 'Match Bet';
            }
            
            // Calculate the effective odds
            processedBet.odds = calculateParleyOdds(bet.data.outcomes);
            
            // If payoutMultiplier is available, use it directly
            if (bet.data.payoutMultiplier) {
              processedBet.odds = bet.data.payoutMultiplier;
            }
          } else {
            // Simple bet with no outcomes data
            processedBet.betType = 'Match Bet';
            processedBet.sport = 'Sports';
            processedBet.league = 'League';
            processedBet.match = bet.data.gameName || 'Sports Bet';
            
            // Calculate odds from amount and payout
            processedBet.odds = processedBet.potentialWin / processedBet.stake || 1;
          }
          
          return processedBet;
        });
        
        setSportsBets(filteredSportsBets);
      } catch (err) {
        console.error('Error fetching sports bets:', err);
        setError('Failed to load sports bets data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBets();
  }, []);
  
  // Apply filters if needed
  let filteredBets = [...sportsBets];
  
  // Apply search filter
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filteredBets = filteredBets.filter(bet => 
      bet.match.toLowerCase().includes(search) || 
      bet.sport.toLowerCase().includes(search) ||
      bet.league.toLowerCase().includes(search) ||
      bet.betType.toLowerCase().includes(search)
    );
  }
  
  // Apply provider filter
  if (selectedProvider && selectedProvider !== 'All Providers') {
    filteredBets = filteredBets.filter(bet => bet.provider === selectedProvider);
  }
  
  // Apply date filter
  if (dateFilterEnabled && startDate && endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    filteredBets = filteredBets.filter(bet => {
      const betDate = new Date(bet.date).getTime();
      return betDate >= start && betDate <= end;
    });
  }
  
  // Apply sort
  if (sortOption) {
    switch (sortOption) {
      case 'dateDesc':
        filteredBets.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'dateAsc':
        filteredBets.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'amountDesc':
        filteredBets.sort((a, b) => b.stake - a.stake);
        break;
      case 'amountAsc':
        filteredBets.sort((a, b) => a.stake - b.stake);
        break;
      case 'payoutDesc':
        filteredBets.sort((a, b) => b.potentialWin - a.potentialWin);
        break;
      case 'payoutAsc':
        filteredBets.sort((a, b) => a.potentialWin - b.potentialWin);
        break;
      case 'oddsDesc':
        filteredBets.sort((a, b) => b.odds - a.odds);
        break;
      case 'oddsAsc':
        filteredBets.sort((a, b) => a.odds - b.odds);
        break;
      default:
        filteredBets.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }
  
  // Calculate total stats
  const totalStake = filteredBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalWins = filteredBets
    .filter(bet => bet.result === 'Win')
    .reduce((sum, bet) => sum + bet.potentialWin, 0);
  const totalLosses = filteredBets
    .filter(bet => bet.result === 'Loss')
    .reduce((sum, bet) => sum + bet.stake, 0);
  const profit = totalWins - totalStake;
  
  // Group bets by betType for summary
  const betTypeSummary = filteredBets.reduce((acc, bet) => {
    const betType = bet.betType.includes('Parlay') ? 'Parlays' : 'Single Bets';
    
    if (!acc[betType]) {
      acc[betType] = {
        count: 0,
        stake: 0,
        wins: 0,
        profit: 0
      };
    }
    
    acc[betType].count += 1;
    acc[betType].stake += bet.stake;
    
    if (bet.result === 'Win') {
      acc[betType].wins += 1;
      acc[betType].profit += (bet.potentialWin - bet.stake);
    } else if (bet.result === 'Loss') {
      acc[betType].profit -= bet.stake;
    }
    
    return acc;
  }, {});

  if (loading) {
    return <div className="flex justify-center items-center p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-900 text-red-200 p-4 rounded-lg">{error}</div>;
  }

  if (filteredBets.length === 0) {
    return <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <p className="text-lg text-center">No sports bets found. Upload sports bets JSON data to see statistics.</p>
    </div>;
  }

  return (
    <div className="relative">
      {/* Sports Summary Stats */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-xl font-medium mb-4">Sports Betting Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Stake</div>
            <div className="text-xl font-medium">{formatCurrency(totalStake)}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Wins</div>
            <div className="text-xl font-medium text-green-400">{formatCurrency(totalWins)}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Losses</div>
            <div className="text-xl font-medium text-red-400">{formatCurrency(totalLosses)}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Overall Profit/Loss</div>
            <div className={`text-xl font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(profit)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bet Type Breakdown */}
      {Object.keys(betTypeSummary).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Performance by Bet Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(betTypeSummary).map(([betType, data]) => (
              <div key={betType} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium">{betType}</h4>
                  <div className={`text-lg font-medium ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(data.profit)}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {data.count} bets • {data.wins} wins • Win rate: {data.count > 0 ? ((data.wins / data.count) * 100).toFixed(1) : 0}%
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${data.count > 0 ? (data.wins / data.count) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Bets Table */}
      <div>
        <h3 className="text-lg font-medium mb-3">Recent Bets</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="text-left p-3 border-b border-gray-700">Date</th>
                <th className="text-left p-3 border-b border-gray-700">Bet Type</th>
                <th className="text-right p-3 border-b border-gray-700">Odds</th>
                <th className="text-right p-3 border-b border-gray-700">Stake</th>
                <th className="text-right p-3 border-b border-gray-700">Payout</th>
                <th className="text-center p-3 border-b border-gray-700">Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredBets.map((bet) => (
                <tr key={bet.id} className="hover:bg-gray-800">
                  <td className="p-3 border-b border-gray-700 text-sm text-gray-300">
                    {formatDate(bet.date)}
                  </td>
                  <td className="p-3 border-b border-gray-700">
                    <div className="font-medium">{bet.betType}</div>
                    <div className="text-sm text-gray-400">{bet.match}</div>
                  </td>
                  <td className="p-3 border-b border-gray-700 text-right">{bet.odds.toFixed(2)}x</td>
                  <td className="p-3 border-b border-gray-700 text-right">{formatCurrency(bet.stake)}</td>
                  <td className="p-3 border-b border-gray-700 text-right">{formatCurrency(bet.potentialWin)}</td>
                  <td className="p-3 border-b border-gray-700 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      bet.result === 'Win' 
                        ? 'bg-green-900 text-green-300' 
                        : bet.result === 'Loss' 
                          ? 'bg-red-900 text-red-300' 
                          : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {bet.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SportsView;