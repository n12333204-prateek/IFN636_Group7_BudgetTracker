import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    totalBudgets: 0,
    expenseCount: 0,
    incomeCount: 0,
    budgetCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const [expRes, incRes, budRes] = await Promise.all([
        axiosInstance.get('/api/expenses', { headers: { Authorization: `Bearer ${user.token}` } }),
        axiosInstance.get('/api/income', { headers: { Authorization: `Bearer ${user.token}` } }),
        axiosInstance.get('/api/budgets', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      const totalExpenses = expRes.data.reduce((sum, e) => sum + Number(e.amount), 0);
      const totalIncome = incRes.data.reduce((sum, i) => sum + Number(i.amount), 0);
      const totalBudgets = budRes.data.reduce((sum, b) => sum + Number(b.limitAmount), 0);

      setSummary({
        totalExpenses,
        totalIncome,
        totalBudgets,
        expenseCount: expRes.data.length,
        incomeCount: incRes.data.length,
        budgetCount: budRes.data.length
      });
    } catch (error) {
      console.log('Could not load summary');
    } finally {
      setLoading(false);
    }
  };

  const netBalance = summary.totalIncome - summary.totalExpenses;

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500 mt-1">Here is your financial overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">${summary.totalIncome.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{summary.incomeCount} records</p>
        </div>

        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-red-500">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">${summary.totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{summary.expenseCount} records</p>
        </div>

        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-purple-500">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-purple-600">${summary.totalBudgets.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{summary.budgetCount} budgets</p>
        </div>

        <div className={`bg-white p-5 shadow rounded-lg border-l-4 ${netBalance >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Net Balance</p>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            ${netBalance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{netBalance >= 0 ? 'Surplus' : 'Deficit'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-red-400">
          <h2 className="text-lg font-bold mb-1 text-gray-700">Expenses</h2>
          <p className="text-gray-400 text-sm mb-4">Track and manage your spending</p>
          <Link to="/expenses"
            className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
            View Expenses
          </Link>
        </div>

        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-green-400">
          <h2 className="text-lg font-bold mb-1 text-gray-700">Income</h2>
          <p className="text-gray-400 text-sm mb-4">Track all your income sources</p>
          <Link to="/income"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
            View Income
          </Link>
        </div>

        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-purple-400">
          <h2 className="text-lg font-bold mb-1 text-gray-700">Budgets</h2>
          <p className="text-gray-400 text-sm mb-4">Plan and monitor spending limits</p>
          <Link to="/budgets"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">
            View Budgets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;