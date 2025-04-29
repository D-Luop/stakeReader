import React, { useState, useEffect, useRef } from 'react';

// Sort options for spin history
type SpinSortOption = 'newest' | 'biggest-wins' | 'biggest-losses';

// Type definitions from original code
type Spin = {
  bet: number;
  win: number;
  date?: string;
  timestamp?: number;
  created_at?: string;
};

type Game = {
  name: string;
  id: string;
  provider?: string;
  type?: string; // 'slots' or 'sports'
  spins: Spin[];
  image?: string;
  profit?: number;
};

// Game image mapping
const gameImages: Record<string, string> = {
  "sugar rush 1000": "/images/sugar-rush-1000.avif",
  "roosters revenge": "/images/rooster.avif",
  "mines": "/images/mines.avif",
  "hilo": "/images/hilo.avif",
  "pump": "/images/pump.avif",
  "infernus": "/images/infernus.avif",
  "pine of plinko 2": "/images/pine-of-plinko-2.avif",
  "dracs stacks": "/images/dracs-stacks.avif",
  "drac's stacks": "/images/dracs-stacks.avif",
  "flip": "/images/flip.avif",
  "plinko": "/images/plinko.avif",
  "chaos crew": "/images/chaos crew.avif",
  "shaolin master": "/images/shaolin-master.avif",
  "hand of anubis": "/images/hand-of-anubis.avif",
  "2025 hit slot": "/images/2025-hit-slot.avif",
  "big bass vegas double down deluxe": "/images/double-down-deluxe.avif",
  "the dog house - muttley crew": "/images/go-house-mutley.avif",
  "magic piggy": "/images/magic-piggy.avif",
  "sugar rush": "/images/sugar-rush.avif",
  "super mega monsters": "/images/super-mega-monsters.avif",
  "hot rocks": "/images/hot-rocks.avif",
  "gates of olympus 1000": "/images/gates-1000.avif",
  "gates of olympus super scatter": "/images/gates-super-scatter.avif",
  "broadsiders!": "/images/broadsiders.avif",
  "bonsai banzai": "/images/bonsai.avif",
  "munchies": "/images/munchies.avif",
  "samurai dogs unleashed": "/images/samurai-dogs-unleashed.avif",
  "buffaloads": "/images/buffaloads.avif",
  "juice monsters": "/images/juice-monsters.avif",
  "book of monsters": "/images/book-of-monsters.avif",
  "skate or die": "/images/skate-or-die.avif",
  "duck hunters": "/images/duck-hunters.avif",
  "brute force": "/images/brute-force.avif",
  "rock paper scissors": "/images/rps.avif",
  "doomsday saloon": "/images/doomsday-saloon.avif",
  "sweet bonanza 1000": "/images/sweet-bonanza-1000.avif",
  "default": "/images/defaultGame.jpeg",
  "san quentin 2: death row": "/images/san-quenten-2.avif",
  "xways hoarder xways": "/images/xways-hoarder-x.avif",
  "fire in the hole 2": "/images/fire-in-the-hole-2.avif",
  "ugliest catch": "/images/ugliest-catch.avif",
  "road rage": "/images/road-rage.avif",
  "xways hoarder 2": "/images/xways-hoarder-2.avif",
  "san quentin xways": "/images/san-quenten.avif",
  "brick snake 2000": "/images/brick-snake-2000.avif",
  "donut division": "/images/donut-division.avif",
  "barn festival": "/images/barn-festival.avif",
  "wild west gold": "/images/wild-west-wilds.avif",
  "warrior ways": "/images/warrior-ways.avif",
  "strength of hercules": "/images/strength-of-herc.avif",
  "wanted": "/images/wanted-dead-or-alive.avif",
  "the dog house megaways": "/images/dog-house-mega.avif",
  "toshi video club": "/images/toshii-video.avif",
  "bluebeard's treasure": "/images/bluebeard.avif",
  "tanked": "/images/tanked.avif",
  "dj psycho": "/images/dj-psycho.avif",
  "outsourced: payday": "/images/outsourced-payday.avif",
  "outsourced": "/images/outsourced.avif",
  "the crypt": "/images/the-crypt.avif",
  "monkey's gold xpays": "/images/monkeys-gold-xpays.avif",
  "infectious 5 xways": "/images/infectious-5-xways.avif",
  "fire in the hole xbomb": "/images/fire-in-the-hole-x.avif",
  "mental": "/images/mental.avif",
  "mental 2": "/images/mental-2.avif",
  "dead, dead or deader": "/images/dead-dead-or-dead.avif",
  "folsom prison": "/images/folsom-prison.avif",
  "stockholm syndrome": "/images/stockholm-syndrome.avif",
  "das xboot": "/images/das-xboot.avif",
  "blood & shadow": "/images/blood-and-shadow.avif",
  "blood & shadow 2": "/images/blood-and-shadow-2.avif",
  "poker": "/images/poker.avif",
  "crash": "/images/crash.avif",
  "slide": "/images/slide.avif",
  "keno": "/images/keno.avif",
  "tome of life": "/images/tome-of-life.avif",
  "cases": "/images/cases.avif",
  "diamonds": "/images/diamonds.avif",
  "dice": "/images/dice.avif",
  "limbo": "/images/limbo.avif",
  "dragon tower": "/images/dragon-tower.avif",
  "sportsbook": "/images/soccer.avif",
  "cash surge": "/images/cash-surge.avif",
  "aviamasters": "/images/avia-masters.avif",
  "chicken man": "/images/chicken-man.avif",
  "gold express": "/images/gold-express.avif",
  "avia-masters": "/images/double-rainbow.avif",
  "king carrot": "/images/king-carrot.avif",
  "barbarossa": "/images/barbarossa.avif",
  "le pharaoh": "/images/le-pharoah.avif",
  "buddha megaways": "/images/buddha-megaways.avif",
  "donny dough": "/images/donny-dough.avif",
  "lucky ducky": "/images/lucky-ducky.avif",
  "barbarossa revenge": "/images/barb-revenge.avif",
  "fire portals": "/images/fire-portals.avif",
  "puffer stacks": "/images/puffer-stacks.avif",
  "ember fall": "/images/ember-fall.avif",
  "le bandit": "/images/le-bandit.avif",
  "wings of horus": "/images/wings-of-horus.avif",
  "the ringmaster's whopping wins": "/images/ringmaster.avif",
  "sixsixsix": "/images/six-six.avif",
  "tiny toads": "/images/tiny-toad.avif",
  "super sticky piggy": "/images/super-sticky.avif",
  "flaming chicken: highway hazard": "/images/flaming-chicken.avif",
  "razor ways": "/images/razor-ways.avif",
  "zombie rabbit invasion": "/images/zombie-rabbit.avif",
  "zeus vs hades - gods of war": "/images/zeus-vs-hades.avif",
  "jokerjam": "/images/joker-jam.avif",
  "blaze buddies": "/images/blaze-buddies.avif",
  "barrel bonanza": "/images/barrel-bonanza.avif",
};

// Helper functions
function getGameImage(gameName: string): string {
  const lowercaseName = gameName.toLowerCase();
  return gameImages[lowercaseName] || gameImages.default;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDateTime(timestamp: number | string): string {
  if (!timestamp) return 'Unknown date';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp) 
    : new Date(timestamp);
    
  return date.toLocaleString();
}

const SlotsView = ({ 
  searchTerm, 
  selectedProvider, 
  sortOption, 
  dateFilterEnabled, 
  startDate, 
  endDate 
}) => {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({});
  const [spinSortOptions, setSpinSortOptions] = useState<Record<string, SpinSortOption>>({});
  const [totalProfit, setTotalProfit] = useState(0);
  const [columnCount, setColumnCount] = useState(4);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for game cards to position dropdowns
  const gameCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Update column count on resize
  useEffect(() => {
    const updateColumnCount = () => {
      if (window.innerWidth >= 1280) setColumnCount(4);
      else if (window.innerWidth >= 1024) setColumnCount(3);
      else if (window.innerWidth >= 768) setColumnCount(2);
      else setColumnCount(1);
    };
    
    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  // Toggle spin history visibility
  const toggleSpinHistory = (gameId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setExpandedGames(prev => {
      const newState = {...prev};
      
      if (newState[gameId]) {
        delete newState[gameId];
      } else {
        // Close all other dropdowns
        Object.keys(newState).forEach(key => {
          delete newState[key];
        });
        newState[gameId] = true;
        
        // Initialize spin sort option for this game if not set
        if (!spinSortOptions[gameId]) {
          setSpinSortOptions(prev => ({
            ...prev,
            [gameId]: 'newest'
          }));
        }
      }
      
      return newState;
    });
  };
  
  // Change spin sort option
  const changeSpinSortOption = (gameId: string, option: SpinSortOption, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSpinSortOptions(prev => ({
      ...prev,
      [gameId]: option
    }));
  };
  
  // Handle clicks outside to close expanded items
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (Object.keys(expandedGames).length === 0) return;
      
      const target = event.target as Element;
      const clickedOnToggle = target.closest('.spin-history-toggle');
      const clickedOnPanel = target.closest('.spin-history-panel');
      
      if (clickedOnToggle || clickedOnPanel) return;
      
      setExpandedGames({});
    };
    
    document.addEventListener('click', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [expandedGames]);

  // Apply filters and sorting when any filter prop changes
  useEffect(() => {
    if (allGames.length > 0) {
      // First filter by type - only show slots!
      let filtered = allGames.filter(game => game.type !== 'sports');
      
      // Apply date filter if enabled
      if (dateFilterEnabled && (startDate || endDate)) {
        const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
        const endTimestamp = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Date.now();
        
        filtered = filtered.map(game => {
          const filteredSpins = game.spins.filter(spin => {
            const spinTime = spin.timestamp || (spin.created_at ? new Date(spin.created_at).getTime() : 0);
            return spinTime >= startTimestamp && spinTime <= endTimestamp;
          });
          
          if (filteredSpins.length === 0) {
            return null;
          }
          
          const totalBet = filteredSpins.reduce((acc, spin) => acc + spin.bet, 0);
          const totalWin = filteredSpins.reduce((acc, spin) => acc + spin.win, 0);
          
          return {
            ...game,
            spins: filteredSpins,
            profit: totalWin - totalBet
          };
        }).filter(game => game !== null) as Game[];
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(game => 
          game.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by provider
      if (selectedProvider && selectedProvider !== "All Providers") {
        filtered = filtered.filter(game => {
          // Now that we handle 'Unknown' as 'Stake Originals' on the backend,
          // we don't need special handling here
          return game.provider === selectedProvider;
        });
      }
      
      // Apply sorting
      switch (sortOption) {
        case 'profit-high':
          filtered.sort((a, b) => (b.profit || 0) - (a.profit || 0));
          break;
        case 'profit-low':
          filtered.sort((a, b) => (a.profit || 0) - (b.profit || 0));
          break;
        case 'bets-high':
          filtered.sort((a, b) => b.spins.length - a.spins.length);
          break;
        case 'bets-low':
          filtered.sort((a, b) => a.spins.length - b.spins.length);
          break;
        default:
          filtered.sort((a, b) => (b.profit || 0) - (a.profit || 0));
      }
      
      setFilteredGames(filtered);
      
      // Calculate total profit
      const total = filtered.reduce((sum, game) => sum + (game.profit || 0), 0);
      setTotalProfit(total);
    }
  }, [allGames, searchTerm, selectedProvider, sortOption, dateFilterEnabled, startDate, endDate]);

  // Fetch data on component mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    fetch('/api/bets')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data);
          setAllGames([]);
          setFilteredGames([]);
          setError("Received invalid data format from server");
          setIsLoading(false);
          return;
        }
        
        const processedGames: Record<string, Game> = {};
        
        // Safely process data, handling any unexpected structures
        data.forEach((entry: any) => {
          if (!entry || !entry.data) {
            return; // Skip invalid entries
          }
          
          try {
            const gameName = entry.data.gameName || "Unknown Game";
            const amount = parseFloat(entry.data.amount || 0);
            const payout = parseFloat(entry.data.payout || 0);
            const timestamp = entry.data.createdAt || null;
            const created_at = entry.created_at || null;
            const provider = entry.data.provider || "Stake Originals";
            // Get the bet type, defaulting to 'slots' if not specified
            const betType = entry.type || 'slots';
            
            if (!processedGames[gameName]) {
              processedGames[gameName] = {
                name: gameName,
                id: `${gameName}-${Math.random().toString(36).substring(2, 9)}`,
                provider: provider,
                type: betType,
                spins: [],
                image: getGameImage(gameName)
              };
            }
            
            processedGames[gameName].spins.push({
              bet: amount,
              win: payout,
              date: timestamp ? formatDateTime(timestamp) : undefined,
              timestamp: timestamp || undefined,
              created_at: created_at
            });
          } catch (err) {
            console.error('Error processing bet entry:', err);
          }
        });
        
        // Sort spins and calculate profits
        Object.values(processedGames).forEach((game) => {
          game.spins.sort((a, b) => {
            const aTime = a.timestamp || (a.created_at ? new Date(a.created_at).getTime() : 0);
            const bTime = b.timestamp || (b.created_at ? new Date(b.created_at).getTime() : 0);
            return bTime - aTime;
          });
          
          // Calculate profit for each game
          const totalBet = game.spins.reduce((acc, spin) => acc + spin.bet, 0);
          const totalWin = game.spins.reduce((acc, spin) => acc + spin.win, 0);
          game.profit = totalWin - totalBet;
        });
        
        // Convert to array, filter out sports bets, and sort by profit
        const sortedGames = Object.values(processedGames)
          .filter(game => game.type !== 'sports')
          .sort((a, b) => (b.profit || 0) - (a.profit || 0));
        
        setAllGames(sortedGames);
        setFilteredGames(sortedGames);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching bets:', error);
        setError(`Failed to load bet data: ${error.message}`);
        setAllGames([]);
        setFilteredGames([]);
        setIsLoading(false);
      });
  }, []);

  // Function to get position for spin history panel
  const getSpinHistoryPosition = (index: number) => {
    const row = Math.floor(index / columnCount);
    const isLastRow = row >= Math.floor((filteredGames.length - 1) / columnCount);
    
    // If in last row, position above
    if (isLastRow) {
      return 'top-auto bottom-full mb-2';
    }
    
    // Otherwise position below
    return 'bottom-auto top-full mt-2';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Loading betting data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-300 p-6 rounded-lg text-center my-6">
        <h3 className="text-xl mb-3">Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Summary Stats */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Slots Summary</h2>
          <div className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${formatNumber(totalProfit)}
          </div>
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {filteredGames.length} games • {filteredGames.reduce((total, game) => total + game.spins.length, 0)} total spins
        </div>
      </div>
      
      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game, index) => {
          const totalBet = game.spins.reduce((acc, spin) => acc + spin.bet, 0);
          const totalWin = game.spins.reduce((acc, spin) => acc + spin.win, 0);
          const profit = totalWin - totalBet;
          const totalSpins = game.spins.length;
          const isExpanded = expandedGames[game.id] || false;
          
          return (
            <div 
              key={game.id} 
              ref={el => gameCardRefs.current[game.id] = el}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative"
            >
              {/* Game Header */}
              <div className="p-4 flex items-start">
                <div className="w-16 h-16 bg-gray-700 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={game.image || gameImages.default} 
                    alt={game.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = gameImages.default;
                    }}
                  />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-bold mb-1 truncate">{game.name}</h3>
                  <p className="text-sm text-gray-400">{game.provider}</p>
                  <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                    profit >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    ${formatNumber(profit)}
                  </div>
                </div>
              </div>
              
              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-2 px-4">
                <div className="bg-gray-700 p-2 rounded text-center">
                  <p className="text-xs text-gray-400">Total Bet</p>
                  <p className="font-medium">${formatNumber(totalBet)}</p>
                </div>
                <div className="bg-gray-700 p-2 rounded text-center">
                  <p className="text-xs text-gray-400">Total Win</p>
                  <p className="font-medium">${formatNumber(totalWin)}</p>
                </div>
              </div>
              
              {/* Spin History Button */}
              <div className="p-4">
                <button 
                  onClick={(e) => toggleSpinHistory(game.id, e)}
                  className="w-full text-left flex justify-between items-center bg-gray-700 text-gray-300 rounded p-2 hover:bg-gray-600 transition-colors spin-history-toggle"
                >
                  <span className="text-sm font-medium">Spin History ({totalSpins})</span>
                  <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>
              
              {/* Spin History Dropdown - Fixed Positioning */}
              {isExpanded && (
                <div 
                  className={`fixed z-20 bg-gray-700 rounded-lg p-3 shadow-lg border border-gray-600 w-96 max-h-96 overflow-y-auto spin-history-panel`}
                  style={{
                    // Position dropdown relative to the button that toggles it
                    left: gameCardRefs.current[game.id]?.getBoundingClientRect().left || 0,
                    top: getSpinHistoryPosition(index).includes('top-full') 
                      ? (gameCardRefs.current[game.id]?.getBoundingClientRect().bottom || 0) + window.scrollY
                      : (gameCardRefs.current[game.id]?.getBoundingClientRect().top || 0) + window.scrollY - 300,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-600">
                    <h4 className="text-sm font-medium truncate max-w-[120px]">
                      Spin History
                    </h4>
                    <div className="flex text-xs bg-gray-800 rounded overflow-hidden">
                      <button 
                        className={`px-2 py-1 ${spinSortOptions[game.id] === 'newest' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                        onClick={(e) => changeSpinSortOption(game.id, 'newest', e)}
                      >
                        Newest
                      </button>
                      <button 
                        className={`px-2 py-1 ${spinSortOptions[game.id] === 'biggest-wins' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                        onClick={(e) => changeSpinSortOption(game.id, 'biggest-wins', e)}
                      >
                        Biggest Wins
                      </button>
                      <button 
                        className={`px-2 py-1 ${spinSortOptions[game.id] === 'biggest-losses' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                        onClick={(e) => changeSpinSortOption(game.id, 'biggest-losses', e)}
                      >
                        Biggest Losses
                      </button>
                    </div>
                  </div>
                  
                  {game.spins.length > 0 ? (
                    [...game.spins]
                      .sort((a, b) => {
                        // Apply selected sort option
                        const currentSort = spinSortOptions[game.id] || 'newest';
                        
                        switch (currentSort) {
                          case 'newest':
                            const aTime = a.timestamp || (a.created_at ? new Date(a.created_at).getTime() : 0);
                            const bTime = b.timestamp || (b.created_at ? new Date(b.created_at).getTime() : 0);
                            return bTime - aTime; // Newest first
                            
                          case 'biggest-wins':
                            // Sort by net win (win - bet) descending
                            return (b.win - b.bet) - (a.win - a.bet);
                            
                          case 'biggest-losses':
                            // Sort by net loss (bet - win) descending
                            return (a.win - a.bet) - (b.win - b.bet);
                            
                          default:
                            return 0;
                        }
                      })
                      .map((spin, spinIndex) => {
                        const netProfit = spin.win - spin.bet;
                        
                        return (
                          <div key={spinIndex} className="flex flex-col text-sm py-2 border-b border-gray-600 last:border-0">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">Bet: ${formatNumber(spin.bet)}</span>
                              <span className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                Win: ${formatNumber(spin.win)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <div className="text-xs text-gray-400">
                                {spin.created_at 
                                  ? formatDateTime(spin.created_at) 
                                  : (spin.date || 'Unknown date')}
                              </div>
                              <div className={`text-xs font-medium ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {netProfit >= 0 ? '+' : ''}{formatNumber(netProfit)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-gray-400 text-sm py-2">No spin data available</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredGames.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <div className="text-gray-400 text-5xl mb-4">🎰</div>
          <h3 className="text-xl mb-2">No slots found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your filters or uploading more bet data.</p>
        </div>
      )}
    </div>
  );
};

export default SlotsView;