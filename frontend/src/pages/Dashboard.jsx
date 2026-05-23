import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalExpenses: 0, totalIncome: 0, totalBudgets: 0,
    expenseCount: 0, incomeCount: 0, budgetCount: 0
  });
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      // Load all data in parallel
      const [expRes, incRes, budRes, goalRes] = await Promise.all([
        axiosInstance.get('/api/expenses', { headers: { Authorization: `Bearer ${user.token}` } }),
        axiosInstance.get('/api/income', { headers: { Authorization: `Bearer ${user.token}` } }),
        axiosInstance.get('/api/budgets', { headers: { Authorization: `Bearer ${user.token}` } }),
        axiosInstance.get('/api/savings', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      const totalExpenses = expRes.data.reduce((sum, e) => sum + Number(e.amount), 0);
      const totalIncome = incRes.data.reduce((sum, i) => sum + Number(i.amount), 0);
      const totalBudgets = budRes.data.reduce((sum, b) => sum + Number(b.limitAmount), 0);

      setSummary({
        totalExpenses, totalIncome, totalBudgets,
        expenseCount: expRes.data.length,
        incomeCount: incRes.data.length,
        budgetCount: budRes.data.length
      });
      setBudgets(budRes.data);
      setGoals(goalRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const netBalance = summary.totalIncome - summary.totalExpenses;
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount), 0);
  const hasNoData = summary.expenseCount === 0 && summary.incomeCount === 0 && summary.budgetCount === 0;

  if (loading) return <div className="text-center mt-20 text-gray-400 text-lg">Loading...</div>;

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Here is your financial overview</p>
      </div>

      {hasNoData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <p className="font-bold text-blue-800 mb-1">Get started with BudgetTracker</p>
          <p className="text-blue-600 text-sm mb-4">Follow these three steps to set up your account:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { step: '1', label: 'Add your income', to: '/income' },
              { step: '2', label: 'Create budgets', to: '/budgets' },
              { step: '3', label: 'Track expenses', to: '/expenses' }
            ].map(({ step, label, to }) => (
              <Link key={step} to={to}
                className="flex-1 text-center bg-white border border-blue-300 rounded-lg p-4 hover:bg-blue-50 transition">
                <p className="font-bold text-blue-800">Step {step}</p>
                <p className="text-sm text-blue-600 mt-0.5">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Summary cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-6 shadow-sm rounded-xl border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Total Income</p>
          <p className="text-3xl font-bold text-green-600">${summary.totalIncome.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">{summary.incomeCount} records</p>
        </div>
        <div className="bg-white p-6 shadow-sm rounded-xl border-l-4 border-red-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600">${summary.totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">{summary.expenseCount} records</p>
        </div>
        <div className="bg-white p-6 shadow-sm rounded-xl border-l-4 border-purple-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Total Budget</p>
          <p className="text-3xl font-bold text-purple-600">${summary.totalBudgets.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-1">{summary.budgetCount} budgets</p>
        </div>
        <div className={`bg-white p-6 shadow-sm rounded-xl border-l-4 ${netBalance >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Net Balance</p>
          <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            ${netBalance.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400 mt-1">{netBalance >= 0 ? 'Surplus' : 'Deficit'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 shadow-sm rounded-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800">Budget Health</h2>
              <Link to="/budgets" className="text-sm text-blue-500 hover:underline font-medium">
                Manage →
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No budgets created yet</p>
                <Link to="/budgets"
                  className="inline-block text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                  style={{ backgroundColor: '#1E3A5F' }}>
                  Create your first budget
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {budgets.map(budget => {
                  const pct = budget.limitAmount > 0
                    ? Math.min(100, Math.round((budget.spentAmount / budget.limitAmount) * 100))
                    : 0;
                  const isExceeded = pct >= 100;
                  const isWarning = pct >= 80 && pct < 100;
                  const barColor = isExceeded ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500';
                  const textColor = isExceeded ? 'text-red-600' : isWarning ? 'text-yellow-700' : 'text-green-600';

                  return (
                    <div key={budget._id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">{budget.category}</span>
                          {isExceeded && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Exceeded</span>
                          )}
                          {isWarning && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Near limit</span>
                          )}
                        </div>
                        <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${barColor} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          ${Number(budget.spentAmount).toFixed(2)} spent
                        </span>
                        <span className="text-xs text-gray-400">
                          ${Number(budget.limitAmount).toFixed(2)} limit
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Quick nav + Savings preview */}
        <div className="lg:col-span-2 space-y-5">

          {/* Quick navigation cards with live totals */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/expenses"
              className="bg-white p-5 shadow-sm rounded-xl border-t-4 border-red-400 hover:shadow-md transition block">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-2">${summary.totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.expenseCount} records →</p>
            </Link>
            <Link to="/income"
              className="bg-white p-5 shadow-sm rounded-xl border-t-4 border-green-400 hover:shadow-md transition block">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Income</p>
              <p className="text-2xl font-bold text-green-600 mt-2">${summary.totalIncome.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.incomeCount} records →</p>
            </Link>
            <Link to="/budgets"
              className="bg-white p-5 shadow-sm rounded-xl border-t-4 border-purple-400 hover:shadow-md transition block">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Budgets</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">${summary.totalBudgets.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.budgetCount} active →</p>
            </Link>
            <Link to="/savings"
              className="bg-white p-5 shadow-sm rounded-xl border-t-4 border-blue-400 hover:shadow-md transition block">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Savings</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">${totalSaved.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{goals.length} goals →</p>
            </Link>
          </div>

          {goals.length > 0 && (
            <div className="bg-white p-5 shadow-sm rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-800">Savings Goals</h3>
                <Link to="/savings" className="text-sm text-blue-500 hover:underline font-medium">
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {goals.slice(0, 3).map(goal => {
                  const pct = goal.targetAmount > 0
                    ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
                    : 0;
                  const isComplete = pct >= 100;
                  return (
                    <div key={goal._id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-36">
                          {goal.goalName}
                        </span>
                        <span className={`text-xs font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                          {pct}%{isComplete ? ' ✓' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ${Number(goal.savedAmount).toFixed(2)} of ${Number(goal.targetAmount).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;