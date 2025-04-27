import { createRoute } from '@tanstack/react-router';
import { Route as RootRoute } from './__root'
import UploadForm from '../Components/UploadForm';
import { useEffect, useState } from 'react';

type Spin = {
  bet: number;
  win: number;
  date?: string;
  timestamp?: number;
};

type Game = {
  name: string;
  id: string;
  spins: Spin[];
};

function formatNumber(num: number): string {
  return num.toFixed(2);
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function HomePage() {
  const [games, setGames] = useState<Record<string, Game>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bets')
      .then((res) => res.json())
      .then((data) => {
        const processedGames: Record<string, Game> = {};

        data.forEach((entry: any, index: number) => {
          const gameName = entry.data.gameName;
          const amount = entry.data.amount;
          const payout = entry.data.payout;
          const timestamp = entry.timestamp || entry.createdAt || null;

          if (!processedGames[gameName]) {
            processedGames[gameName] = {
              name: gameName,
              id: `${gameName}-${index}`,
              spins: [],
            };
          }

          processedGames[gameName].spins.push({
            bet: amount,
            win: payout,
            date: timestamp ? formatDateTime(timestamp) : undefined,
            timestamp: timestamp || undefined,
          });
        });

        Object.values(processedGames).forEach((game) => {
          game.spins.sort((a, b) => {
            if (!a.timestamp) return 1;
            if (!b.timestamp) return -1;
            return b.timestamp - a.timestamp;
          });
        });

        setGames(processedGames);
        setIsLoading(false);
        console.log(processedGames)
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



  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Betting Statistics</h1>
        <UploadForm />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(games).map((game, index) => {
            const totalBet = game.spins.reduce((acc, spin) => acc + spin.bet, 0);
            const totalWin = game.spins.reduce((acc, spin) => acc + spin.win, 0);
            const profit = totalWin - totalBet;
            const profitPercentage = totalBet > 0 ? (profit / totalBet) * 100 : 0;
            const totalSpins = game.spins.length;

            return (
              <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-bold mb-3 text-blue-300">{game.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{totalSpins} spins recorded</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-700 p-2 rounded">
                    <p className="text-gray-400">Total Bet</p>
                    <p className="font-bold">${formatNumber(totalBet)}</p>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <p className="text-gray-400">Total Win</p>
                    <p className="font-bold">${formatNumber(totalWin)}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded bg-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">
                      {profit >= 0 ? 'Profit' : 'Loss'}:
                    </span>
                    <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${formatNumber(profit)} ({formatNumber(profitPercentage)}%)
                    </span>
                  </div>
                </div>
                <div className="mb-4 overflow-y-auto max-h-48 bg-gray-700 rounded p-2 mt-4">
                  {game.spins.map((spin, spinIndex) => (
                    <div key={spinIndex} className="flex justify-between text-sm py-1 border-b border-gray-600">
                      <div className="flex flex-col text-left">
                        <span>Bet: ${formatNumber(spin.bet)}</span>
                        {spin.date && <span className="text-xs text-gray-400">{spin.date}</span>}
                      </div>
                      <span className={spin.win > spin.bet ? 'text-green-400' : 'text-red-400'}>
                        Win: ${formatNumber(spin.win)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </header>
    </div>
  );
}

// THIS IS THE IMPORTANT PART:
export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: HomePage,
});