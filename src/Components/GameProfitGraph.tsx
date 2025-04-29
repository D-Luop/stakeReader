import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

type Spin = {
  bet: number;
  win: number;
  date?: string;
  timestamp?: number;
  created_at?: string;
};

// Function to process spins into chart data
function processSpinsForMiniChart(spins: Spin[]) {
  // Sort spins by timestamp or created_at
  const sortedSpins = [...spins].sort((a, b) => {
    const aTime = a.timestamp || (a.created_at ? new Date(a.created_at).getTime() : 0);
    const bTime = b.timestamp || (b.created_at ? new Date(b.created_at).getTime() : 0);
    return aTime - bTime;
  });

  // Calculate running profit
  let runningProfit = 0;
  return sortedSpins.map(spin => {
    runningProfit += (spin.win - spin.bet);
    return { value: runningProfit };
  });
}

export default function MiniProfitGraph({ spins, isPositive }: { spins: Spin[], isPositive: boolean }) {
  // If we don't have enough data points, return null
  if (!spins || spins.length < 2) {
    return null;
  }

  // Process the data for the chart
  const chartData = useMemo(() => processSpinsForMiniChart(spins), [spins]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={isPositive ? "#10b981" : "#ef4444"} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}