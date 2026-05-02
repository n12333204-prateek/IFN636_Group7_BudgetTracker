import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    category: '', limitAmount: '', timePeriod: '', startDate: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchBudgets(); }, []);

  const fetchBudgets = async () => {
    try {
      const res = await axiosInstance.get('/api/budgets', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBudgets(res.data);
    } catch (error) {
      alert('Failed to fetch budgets');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/api/budgets/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBudgets(budgets.map(b => b._id === editingId ? res.data : b));
        setEditingId(null);
      } else {
        const res = await axiosInstance.post('/api/budgets', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBudgets([...budgets, res.data]);
      }
      setFormData({ category: '', limitAmount: '', timePeriod: '', startDate: '' });
    } catch (error) {
      alert('Failed to save budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget._id);
    setFormData({
      category: budget.category,
      limitAmount: budget.limitAmount,
      timePeriod: budget.timePeriod,
      startDate: budget.startDate.substring(0, 10)
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await axiosInstance.delete(`/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBudgets(budgets.filter(b => b._id !== id));
    } catch (error) {
      alert('Failed to delete budget');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Budget Management</h1>

      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          {editingId ? 'Edit Budget' : 'Create New Budget'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" placeholder="e.g. Food, Transport, Health"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spending Limit ($)
              </label>
              <input type="number" placeholder="0.00"
                value={formData.limitAmount}
                onChange={e => setFormData({ ...formData, limitAmount: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select value={formData.timePeriod}
                onChange={e => setFormData({ ...formData, timePeriod: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required>
                <option value="">Select Period</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit"
              className="flex-1 bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700">
              {editingId ? 'Update Budget' : 'Create Budget'}
            </button>
            {editingId && (
              <button type="button"
                onClick={() => { setEditingId(null); setFormData({ category: '', limitAmount: '', timePeriod: '', startDate: '' }); }}
                className="flex-1 bg-gray-400 text-white p-3 rounded-lg font-semibold hover:bg-gray-500">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        {budgets.length === 0 && (
          <p className="text-center text-gray-400 py-8">No budgets yet. Create one above.</p>
        )}
        {budgets.map(budget => {
          const percentage = budget.limitAmount > 0
            ? Math.min(100, Math.round((budget.spentAmount / budget.limitAmount) * 100))
            : 0;
          const barColor = percentage >= 100
            ? 'bg-red-500'
            : percentage >= 80
            ? 'bg-yellow-500'
            : 'bg-green-500';

          return (
            <div key={budget._id} className="bg-white p-4 shadow rounded-lg mb-3">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {budget.category}
                    <span className="text-purple-600 ml-2">
                      ${Number(budget.limitAmount).toFixed(2)} limit
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {budget.timePeriod} · Started {new Date(budget.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-1">
                    Spent:{' '}
                    <span className="font-semibold text-red-600">
                      ${Number(budget.spentAmount).toFixed(2)}
                    </span>
                    {' '}/ ${Number(budget.limitAmount).toFixed(2)}
                    {' '}· Remaining:{' '}
                    <span className="font-semibold text-green-600">
                      ${Math.max(0, budget.limitAmount - budget.spentAmount).toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(budget)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(budget._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                    Delete
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${barColor} transition-all`}
                  style={{ width: `${percentage}%` }}>
                </div>
              </div>
              <p className="text-xs text-right mt-1 text-gray-400">{percentage}% used</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;