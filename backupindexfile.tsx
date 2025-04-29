import { createRoute } from '@tanstack/react-router';
import { Route as RootRoute } from './__root'
import UploadForm from '../Components/UploadForm';
import { useEffect, useState } from 'react';

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
  spins: Spin[];
  image?: string;
  profit?: number;
};

// Sorting options
type SortOption = 'profit-high' | 'profit-low' | 'bets-high' | 'bets-low';

// Game image mapping (keys in lowercase for case-insensitive matching)
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

// Function to get image path with case-insensitive matching
function getGameImage(gameName: string): string {
  const lowercaseName = gameName.toLowerCase();
  return gameImages[lowercaseName] || gameImages.default;
}

function formatNumber(num: number): string {
  // Format with 2 decimal places and add commas for thousands
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

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function HomePage() {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [providers, setProviders] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('profit-high');
  
  // Date range filter
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);

  // Calculate if a dropdown should open upward based on row position
  const shouldOpenUpward = (index: number, totalItems: number, cols: number = 4) => {
    // Calculate the row number (0-indexed)
    const row = Math.floor(index / cols);
    // If it's in the first row, open downward, otherwise upward
    return row > 0;
  };

  // Toggle spin history visibility with improved handling
  const toggleSpinHistory = (gameId: string, e: React.MouseEvent) => {
    // Always prevent default and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    setExpandedGames(prev => {
      // Create a new object to ensure state update
      const newState = {...prev};
      
      // Check if this game is already expanded
      if (newState[gameId]) {
        // If expanded, close it
        delete newState[gameId];
      } else {
        // Otherwise close all others and open this one
        Object.keys(newState).forEach(key => {
          delete newState[key];
        });
        newState[gameId] = true;
      }
      
      return newState;
    });
  };
  
  // Handle clicks outside to close expanded items
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Skip if nothing is expanded
      if (Object.keys(expandedGames).length === 0) return;
      
      // Don't close if clicking on a toggle button or inside a history panel
      const target = event.target as Element;
      const clickedOnToggle = target.closest('.spin-history-toggle');
      const clickedOnPanel = target.closest('.spin-history-panel');
      
      if (clickedOnToggle || clickedOnPanel) return;
      
      // Otherwise, close all expanded items
      setExpandedGames({});
    };
    
    // Use capture phase to ensure we get the click before other handlers
    document.addEventListener('click', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [expandedGames]);

  // Handle search and filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterGames(e.target.value, selectedProvider);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(e.target.value);
    filterGames(searchTerm, e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
    // Apply the new sorting to the currently filtered games
    applySorting(filteredGames, e.target.value as SortOption);
  };

  const handleDateFilterToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilterEnabled(e.target.checked);
    applyFilters(searchTerm, selectedProvider, e.target.checked, startDate, endDate);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (dateFilterEnabled) {
      applyFilters(searchTerm, selectedProvider, true, e.target.value, endDate);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    if (dateFilterEnabled) {
      applyFilters(searchTerm, selectedProvider, true, startDate, e.target.value);
    }
  };

  const filterGames = (term: string, provider: string) => {
    applyFilters(term, provider, dateFilterEnabled, startDate, endDate);
  };

  // Sort games based on the selected option
  const applySorting = (gamesToSort: Game[], option: SortOption) => {
    let sortedGames = [...gamesToSort];
    
    switch (option) {
      case 'profit-high':
        sortedGames.sort((a, b) => (b.profit || 0) - (a.profit || 0));
        break;
      case 'profit-low':
        sortedGames.sort((a, b) => (a.profit || 0) - (b.profit || 0));
        break;
      case 'bets-high':
        sortedGames.sort((a, b) => b.spins.length - a.spins.length);
        break;
      case 'bets-low':
        sortedGames.sort((a, b) => a.spins.length - b.spins.length);
        break;
      default:
        // Default sort by highest profit
        sortedGames.sort((a, b) => (b.profit || 0) - (a.profit || 0));
    }
    
    setFilteredGames(sortedGames);
  };

  const applyFilters = (term: string, provider: string, dateEnabled: boolean, start: string, end: string) => {
    // First, apply date filter if enabled
    let gamesAfterDateFilter = [...allGames];
    
    if (dateEnabled && (start || end)) {
      const startTimestamp = start ? new Date(start).getTime() : 0;
      const endTimestamp = end ? new Date(end).setHours(23, 59, 59, 999) : Date.now(); // End of day
      
      // Create new game objects with filtered spins
      gamesAfterDateFilter = allGames.map(game => {
        const filteredSpins = game.spins.filter(spin => {
          const spinTime = spin.timestamp || (spin.created_at ? new Date(spin.created_at).getTime() : 0);
          return spinTime >= startTimestamp && spinTime <= endTimestamp;
        });
        
        // Only include games that have spins in the date range
        if (filteredSpins.length === 0) {
          return null;
        }
        
        // Recalculate profit
        const totalBet = filteredSpins.reduce((acc, spin) => acc + spin.bet, 0);
        const totalWin = filteredSpins.reduce((acc, spin) => acc + spin.win, 0);
        
        return {
          ...game,
          spins: filteredSpins,
          profit: totalWin - totalBet
        };
      }).filter(game => game !== null) as Game[];
    }
    
    // Update games state with date-filtered results
    setGames(gamesAfterDateFilter);
    
    // Then apply name/provider filters to the date-filtered games
    let filtered = [...gamesAfterDateFilter];
    
    // Filter by search term
    if (term) {
      const searchLower = term.toLowerCase();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by provider
    if (provider !== "All") {
      filtered = filtered.filter(game => {
        // Handle unknown providers
        if(game.provider === "Unknown") {
          return "Stake Originals" === provider;
        }
        return game.provider === provider;
      });
    }
    
    // Apply the current sort option to the filtered results
    applySorting(filtered, sortOption);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedProvider("All");
    setDateFilterEnabled(false);
    setStartDate("");
    setEndDate("");
    setGames(allGames);
    // Apply the current sort option to all games
    applySorting(allGames, sortOption);
  };

  useEffect(() => {
    fetch('/api/bets')
      .then((res) => res.json())
      .then((data) => {
        const processedGames: Record<string, Game> = {};
        const providerSet = new Set<string>();
        
        data.forEach((entry: any, index: number) => {
          const gameName = entry.data.gameName;
          const amount = entry.data.amount;
          const payout = entry.data.payout;
          const timestamp = entry.data.createdAt || null;
          const created_at = entry.created_at || null;
          const provider = entry.data.provider || "Unknown";
          
          // Add provider to unique set
          if (provider == "Unknown") {
            providerSet.add("Stake Originals");
          }
          else {
            providerSet.add(provider);
          }

          

          if (!processedGames[gameName]) {
            processedGames[gameName] = {
              name: gameName,
              id: `${gameName}-${index}`,
              provider: provider,
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
        });

        // Sort spins by timestamp or created_at (newest first)
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

        // Convert to array and sort by profit (most profitable first)
        const sortedGames = Object.values(processedGames).sort((a, b) => 
          (b.profit || 0) - (a.profit || 0)
        );

        // Get all unique providers
        const allProviders = ["All", ...Array.from(providerSet)].sort();
        
        // Set the earliest date in the dataset
        if (sortedGames.length > 0) {
          let earliestDate: number | undefined;
          
          // Find earliest date across all games
          sortedGames.forEach(game => {
            game.spins.forEach(spin => {
              const spinTime = spin.timestamp || (spin.created_at ? new Date(spin.created_at).getTime() : undefined);
              if (spinTime && (!earliestDate || spinTime < earliestDate)) {
                earliestDate = spinTime;
              }
            });
          });
          
          if (earliestDate) {
            setStartDate(formatDateForInput(new Date(earliestDate)));
          }
        }
        
        setAllGames(sortedGames);
        setGames(sortedGames);
        setFilteredGames(sortedGames);
        setProviders(allProviders);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching bets:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="mt-4">Loading betting data...</p>
        </div>
      </div>
    );
  }

  // Determine number of columns for positioning calculations
  const getColumnCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 4; // lg
      if (window.innerWidth >= 768) return 2;  // md
      return 1; // sm
    }
    return 4; // default for server-side rendering
  };

  const columnCount = getColumnCount();

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left sidebar - Fixed position */}
      <div className="w-80 h-full fixed left-0 top-0 bg-gray-800 p-3 overflow-y-auto">
        <h1 className="text-3xl font-bold">Statistics</h1>
        <div className="mt-4 mb-6 p-4 rounded-lg bg-gray-700">
  <div className="flex items-center justify-between">
    <span className="text-gray-300">Total Profit/Loss:</span>
    <span className={`text-xl font-bold ${
      filteredGames.reduce((total, game) => total + (game.profit || 0), 0) >= 0 
      ? 'text-green-400' 
      : 'text-red-400'
    }`}>
      ${formatNumber(filteredGames.reduce((total, game) => total + (game.profit || 0), 0))}
    </span>
  </div>
  <div className="mt-2 text-xs text-gray-400">
    Based on current filters ({filteredGames.length} games)
  </div>
</div>
        
        {/* Upload Form */}
          <UploadForm />
        
        {/* Search and filter controls */}
        <div className="mb-6 bg-gray-700 p-4 rounded-lg">
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  filterGames("", selectedProvider);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Provider Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1 text-left">Provider</label>
            <select
              value={selectedProvider}
              onChange={handleProviderChange}
              className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none"
            >
              {providers.map(provider => (
                <option key={provider} value={provider}>
                  {provider === "All" ? "All Providers" : provider}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort Order */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1 text-left">Sort By</label>
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none"
            >
              <option value="profit-high">Highest Profit</option>
              <option value="profit-low">Lowest Profit</option>
              <option value="bets-high">Most Bets</option>
              <option value="bets-low">Fewest Bets</option>
            </select>
          </div>
          
          {/* Date range filter */}
          <div className="border-t border-gray-600 pt-4 mt-4">
            <div className="flex items-center mb-3">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={dateFilterEnabled}
                  onChange={handleDateFilterToggle}
                  className="w-4 h-4 bg-gray-600 border-gray-500 rounded focus:ring-blue-600"
                />
                <span className="ml-2 text-sm font-medium text-gray-300">Filter by date range</span>
              </label>
            </div>
            
            <div className={`${dateFilterEnabled ? '' : 'opacity-50'}`}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-400 mb-1 text-left">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  disabled={!dateFilterEnabled}
                  className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 text-left">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  disabled={!dateFilterEnabled}
                  className="w-full p-3 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Results count and reset button */}
          <div className="flex flex-col mt-4 pt-4 border-t border-gray-600">
            <div className="text-left text-gray-300 mb-3">
              Showing {filteredGames.length} of {allGames.length} games
            </div>
            
            <button 
              onClick={resetFilters}
              className="w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main content area - Scrollable */}
      <div className="ml-80 flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game, index) => {
            const totalBet = game.spins.reduce((acc, spin) => acc + spin.bet, 0);
            const totalWin = game.spins.reduce((acc, spin) => acc + spin.win, 0);
            const profit = totalWin - totalBet;
            const totalSpins = game.spins.length;
            const isExpanded = expandedGames[game.id] || false;
            const openUpward = shouldOpenUpward(index, filteredGames.length, columnCount);

            return (
              <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col relative">
                {/* Game header with image, name, and profit - Top section */}
                <div className="flex text-left items-start">
                <div className="w-16 h-auto mr-3 rounded-md overflow-hidden flex-shrink-0">
  <img 
    src={game.image || gameImages.default} 
    alt={game.name} 
    className="w-full object-contain" // changed to object-contain
    onError={(e) => {
      (e.target as HTMLImageElement).src = gameImages.default;
    }}
  />
</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-blue-300 uppercase">{game.name}</h2>
                        <p className="text-gray-400 text-sm text-left">{totalSpins} spins recorded</p>
                        <p className="text-gray-500 text-xs text-left mt-1">{game.provider != "Unknown" && game.provider || game.provider == "Unknown" && "Stake Originals" || "Unknown provider"}</p>
                      </div>
                      <div className={`ml-2 px-2 py-1 rounded text-sm font-medium ${profit >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        ${formatNumber(profit)} 
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Flexible space to push remaining elements to bottom */}
                <div className="flex-grow"></div>
                
                {/* Stats section - Always at bottom of card */}
                <div className="grid grid-cols-2 gap-4 text-sm my-4">
                  <div className="bg-gray-700 p-2 rounded">
                    <p className="text-gray-400">Total Bet</p>
                    <p className="font-bold">${formatNumber(totalBet)}</p>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <p className="text-gray-400">Total Win</p>
                    <p className="font-bold">${formatNumber(totalWin)}</p>
                  </div>
                </div>
                
                {/* Spin History Dropdown Button - Always at bottom */}
                <button 
                  onClick={(e) => toggleSpinHistory(game.id, e)}
                  className="w-full text-left flex justify-between items-center bg-gray-700 text-gray-300 rounded p-2 hover:bg-gray-600 transition-colors spin-history-toggle"
                >
                  <span className="font-medium">Spin History ({game.spins.length})</span>
                  <span className="transform transition-transform duration-200" style={{ 
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                </button>
                
                {/* Spin History Content - Absolute positioned dropdown with smart positioning */}
                {isExpanded && (
                  <div 
                    className={`absolute z-10 bg-gray-700 rounded p-2 shadow-lg border border-gray-600 w-80 max-h-96 overflow-y-auto spin-history-panel left-4 ${openUpward ? 'bottom-16' : 'top-16'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {game.spins.map((spin, spinIndex) => (
                      <div key={spinIndex} className="flex flex-col text-sm py-2 border-b border-gray-600 last:border-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300">Bet: ${formatNumber(spin.bet)}</span>
                          <span className={spin.win > spin.bet ? 'text-green-400' : 'text-red-400'}>
                            Win: ${formatNumber(spin.win)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 text-left">
                          {spin.created_at 
                            ? formatDateTime(spin.created_at) 
                            : (spin.date || 'Unknown date')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {filteredGames.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-6 text-center w-full">
            <p className="text-lg text-gray-300">No games match your search criteria.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// THIS IS THE IMPORTANT PART:
export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: HomePage,
});