import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Graph = () => {
  // Sample data - in a real implementation, this would come from props or an API
  const data = [
    { date: 'Jan', profit: 3000 },
    { date: 'Feb', profit: -1500 },
    { date: 'Mar', profit: 2000 },
    { date: 'Apr', profit: 5000 },
    { date: 'May', profit: -2500 },
    { date: 'Jun', profit: 4000 },
    { date: 'Jul', profit: 7000 },
  ];

  // Custom tooltip to show dollar amount
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const profit = payload[0].value;
      const isPositive = profit >= 0;
      
      return (
        <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow-lg">
          <p className="text-sm">{`${payload[0].payload.date}: `}
            <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              ${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Profit/Loss Trend</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#9CA3AF' }} 
            axisLine={{ stroke: '#4B5563' }}
          />
          <YAxis 
            tick={{ fill: '#9CA3AF' }}
            axisLine={{ stroke: '#4B5563' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="profit" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4, fill: '#1F2937' }}
            activeDot={{ stroke: '#3B82F6', strokeWidth: 2, r: 6, fill: '#3B82F6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;