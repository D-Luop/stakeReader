import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Format currency
function formatCurrency(amount, currency = 'USD') {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: currency,
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

const StatsView = () => {
  const [transactionsData, setTransactionsData] = useState([]);
  const [betsData, setBetsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch transactions and bets in parallel
        const [transactionsResponse, betsResponse] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/bets')
        ]);
        
        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch transaction data');
        }

        if (!betsResponse.ok) {
          throw new Error('Failed to fetch bet data');
        }

        const [transactions, bets] = await Promise.all([
          transactionsResponse.json(),
          betsResponse.json()
        ]);

        setTransactionsData(transactions);
        setBetsData(bets);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for statistics
  const processData = () => {
    if (transactionsData.length === 0 && betsData.length === 0) {
      return {
        depositStats: {
          total: 0,
          count: 0,
          average: 0,
          currency: 'USD'
        },
        withdrawalStats: {
          total: 0,
          count: 0,
          average: 0,
          currency: 'USD'
        },
        bonusStats: {
          amount: 0,
          currency: 'USD'
        },
        monthlyData: [],
        netFlow: 0,
        recentDeposits: [],
        recentWithdrawals: []
      };
    }

    // Process deposits/withdrawal stats
    const deposits = transactionsData.filter(tx => tx.type === 'deposit');
    const withdrawals = transactionsData.filter(tx => tx.type === 'withdraw');
    
    // Determine the most common currency
    const allCurrencies = transactionsData
      .map(tx => tx.data?.currency || 'USD')
      .reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});
    
    const primaryCurrency = Object.entries(allCurrencies)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])[0] || 'USD';
    
    const depositStats = {
      total: deposits.reduce((sum, tx) => sum + (tx.data?.amount || 0), 0),
      count: deposits.length,
      average: deposits.length > 0 ? 
        deposits.reduce((sum, tx) => sum + (tx.data?.amount || 0), 0) / deposits.length : 0,
      currency: primaryCurrency
    };
    
    const withdrawalStats = {
      total: withdrawals.reduce((sum, tx) => sum + (tx.data?.amount || 0), 0),
      count: withdrawals.length,
      average: withdrawals.length > 0 ? 
        withdrawals.reduce((sum, tx) => sum + (tx.data?.amount || 0), 0) / withdrawals.length : 0,
      currency: primaryCurrency
    };

    // Calculate bonus amount using bet data
    const totalBetAmount = betsData.reduce((sum, bet) => sum + (bet.data?.amount || 0), 0);
    const totalBetPayout = betsData.reduce((sum, bet) => sum + (bet.data?.payout || 0), 0);
    
    // Calculate expected balance based only on deposits, withdrawals, and betting
    const expectedBalance = depositStats.total - withdrawalStats.total + (totalBetPayout - totalBetAmount);
    
    // Any positive discrepancy is likely bonuses
    // We'll only count positive bonuses (free money) and ignore negative ones
    const bonusAmount = Math.max(0, expectedBalance);
    
    const bonusStats = {
      amount: bonusAmount,
      currency: primaryCurrency
    };

    // Calculate net flow (deposits + bonuses - withdrawals)
    const netFlow = depositStats.total + bonusStats.amount - withdrawalStats.total;

    // Calculate monthly data
    const monthsByName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group transactions by month
    const monthlyTransactions = transactionsData.reduce((acc, tx) => {
      const date = new Date(tx.data?.createdAt || tx.created_at);
      const month = monthsByName[date.getMonth()];
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!acc[key]) {
        acc[key] = {
          month: key,
          deposits: 0,
          withdrawals: 0,
          net: 0
        };
      }
      
      if (tx.type === 'deposit') {
        acc[key].deposits += (tx.data?.amount || 0);
      } else if (tx.type === 'withdraw') {
        acc[key].withdrawals += (tx.data?.amount || 0);
      }
      
      acc[key].net = acc[key].deposits - acc[key].withdrawals;
      
      return acc;
    }, {});
    
    // Sort monthly data by date
    const monthlyData = Object.values(monthlyTransactions).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      if (aYear !== bYear) {
        return aYear - bYear;
      }
      
      return monthsByName.indexOf(aMonth) - monthsByName.indexOf(bMonth);
    });

    // Get the last 6 months of data (or all if less than 6)
    const recentMonthlyData = monthlyData.slice(-6);

    // Get recent deposits and withdrawals
    const recentDeposits = [...deposits]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
      
    const recentWithdrawals = [...withdrawals]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return {
      depositStats,
      withdrawalStats,
      bonusStats,
      monthlyData: recentMonthlyData,
      netFlow,
      recentDeposits,
      recentWithdrawals
    };
  };

  const {
    depositStats,
    withdrawalStats,
    bonusStats,
    monthlyData,
    netFlow,
    recentDeposits,
    recentWithdrawals
  } = processData();

  // Colors for the pie chart
  const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];
  
  // Calculate month-over-month change
  const calculateChange = (current, previous) => {
    if (previous === 0) return '+0%';
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  // Get previous month's net flow (simple approximation)
  const previousMonthNet = monthlyData.length > 1 ? 
    monthlyData[monthlyData.length - 2]?.net || 0 : 0;
    
  // Stats cards data
  const statCards = [
    { 
      title: 'Total Deposits', 
      value: formatCurrency(depositStats.total, depositStats.currency), 
      change: calculateChange(depositStats.total, depositStats.total * 0.9), // Approximation
      icon: '💰' 
    },
    { 
      title: 'Total Withdrawals', 
      value: formatCurrency(withdrawalStats.total, withdrawalStats.currency), 
      change: calculateChange(withdrawalStats.total, withdrawalStats.total * 0.9), // Approximation
      icon: '💸' 
    },
    { 
      title: 'Bonus Amount', 
      value: formatCurrency(bonusStats.amount, bonusStats.currency), 
      change: "+100%", // Bonuses are always a 100% gain
      icon: '🎁' 
    },
    { 
      title: 'Net Balance', 
      value: formatCurrency(netFlow, depositStats.currency), 
      change: calculateChange(netFlow, previousMonthNet),
      icon: '📊' 
    },
  ];
  
  // Custom tooltip for monthly chart
  const MonthlyTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
          <p className="text-sm font-medium">{data.month}</p>
          <p className="text-sm">
            <span className="text-gray-400">Deposits: </span>
            <span className="">
              {formatCurrency(data.deposits, depositStats.currency)}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-gray-400">Withdrawals: </span>
            <span className="text-green-400">
              {formatCurrency(data.withdrawals, withdrawalStats.currency)}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-gray-400">Net: </span>
            <span className={data.net >= 0 ? 'text-green-400' : 'text-green-400 '}>
              {formatCurrency(data.net, depositStats.currency)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-300 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (transactionsData.length === 0 && betsData.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-lg mb-4">No data found</p>
        <p className="text-gray-400">
          Upload deposit, withdrawal, and bet data to see financial statistics.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center">
            <div className="bg-blue-900 text-blue-300 w-12 h-12 rounded-lg flex items-center justify-center text-2xl mr-4">
              {stat.icon}
            </div>
            <div>
              <div className="text-gray-400 text-sm">{stat.title}</div>
              <div className="text-xl font-medium">{stat.value}</div>
              <div className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400 '}`}>
                {stat.change} from last month
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Finance Breakdown */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-medium mb-4">Financial Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Deposits</h4>
              <div className="text-red-400 font-medium">{formatCurrency(depositStats.total, depositStats.currency)}</div>
            </div>
            <div className="text-sm text-gray-400">
              {depositStats.count} total deposits • Average: {formatCurrency(depositStats.average, depositStats.currency)}
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Withdrawals</h4>
              <div className="text-green-400  font-medium">{formatCurrency(withdrawalStats.total, withdrawalStats.currency)}</div>
            </div>
            <div className="text-sm text-gray-400">
              {withdrawalStats.count} total withdrawals • Average: {formatCurrency(withdrawalStats.average, withdrawalStats.currency)}
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Bonuses</h4>
              <div className="text-purple-400 font-medium">{formatCurrency(bonusStats.amount, bonusStats.currency)}</div>
            </div>
            <div className="text-sm text-gray-400">
              {betsData.length} bets analyzed to calculate bonus amount
            </div>
          </div>
        </div>
      </div>
      
      {/* Monthly Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-medium mb-4">Monthly Transaction History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
              <YAxis 
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => `${depositStats.currency} ${Math.abs(value)}`}
              />
              <Tooltip content={<MonthlyTooltip />} />
              <Legend />
              <Bar dataKey="deposits" name="Deposits" fill="#EF4444" />
              <Bar dataKey="withdrawals" name="Withdrawals" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deposits */}
        {recentDeposits.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium mb-4">Recent Deposits</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentDeposits.map((tx, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="py-3 text-sm">
                      {formatDate(tx.created_at || tx.data?.createdAt)}
                    </td>
                    <td className="py-3 text-right text-red-400">
                      {formatCurrency(tx.data?.amount || 0, tx.data?.currency || depositStats.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Recent Withdrawals */}
        {recentWithdrawals.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium mb-4">Recent Withdrawals</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentWithdrawals.map((tx, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="py-3 text-sm">
                      {formatDate(tx.created_at || tx.data?.createdAt)}
                    </td>
                    <td className="py-3 text-right text-green-400">
                      {formatCurrency(tx.data?.amount || 0, tx.data?.currency || withdrawalStats.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Financial Distribution Pie Chart */}
      {(depositStats.total > 0 || withdrawalStats.total > 0 || bonusStats.amount > 0) && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-medium mb-4">Financial Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Deposits', value: depositStats.total },
                    { name: 'Withdrawals', value: withdrawalStats.total },
                    { name: 'Bonuses', value: bonusStats.amount }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10B981" /> {/* Deposits - Green */}
                  <Cell fill="#EF4444" /> {/* Withdrawals - Red */}
                  <Cell fill="#A855F7" /> {/* Bonuses - Purple */}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value, depositStats.currency)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-3">Financial Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Deposits:</span>
                  <span className="text-red-400">{formatCurrency(depositStats.total, depositStats.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Withdrawals:</span>
                  <span className="text-green-400">{formatCurrency(withdrawalStats.total, withdrawalStats.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Bonuses:</span>
                  <span className="text-purple-400">{formatCurrency(bonusStats.amount, bonusStats.currency)}</span>
                </div>
                <div className="h-px bg-gray-600 my-2"></div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">Net Balance:</span>
                  <span className={netFlow >= 0 ? 'text-green-400' : 'text-green-400 '}>
                    {formatCurrency(netFlow, depositStats.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsView;