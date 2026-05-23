import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const today = new Date().toISOString().substring(0, 10);
const ITEMS_PER_PAGE = 3;

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    category: '', limitAmount: '', timePeriod: '', startDate: today
  });
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchBudgets(); }, []);
  useEffect(() => { setCurrentPage(1); }, [budgets.length]);

  const fetchBudgets = async () => {
    try {
      const res = await axiosInstance.get('/api/budgets', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBudgets(res.data);
    } catch {
      setError('Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/api/budgets/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBudgets(budgets.map(b => b._id === editingId ? res.data : b));
        setEditingId(null);
        showSuccess('Budget updated successfully!');
      } else {
        // Prevent duplicate categories
        const existing = budgets.find(
          b => b.category.toLowerCase() === formData.category.toLowerCase()
        );
        if (existing) {
          setError(`A budget for "${formData.category}" already exists. Please edit the existing one.`);
          return;
        }
        const res = await axiosInstance.post('/api/budgets', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBudgets([...budgets, res.data]);
        showSuccess('Budget created successfully!');
      }
      setFormData({ category: '', limitAmount: '', timePeriod: '', startDate: today });
    } catch {
      setError('Failed to save budget. Please try again.');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ category: '', limitAmount: '', timePeriod: '', startDate: today });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await axiosInstance.delete(`/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBudgets(budgets.filter(b => b._id !== id));
      showSuccess('Budget deleted.');
    } catch {
      setError('Failed to delete budget.');
    }
  };

  // Pagination
  const totalPages = Math.ceil(budgets.length / ITEMS_PER_PAGE);
  const paginatedBudgets = budgets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="text-center mt-20 text-gray-400 text-lg">Loading...</div>;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Budget Management</h1>

      {successMsg && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-6 shadow-sm rounded-xl mb-6">
        <h2 className="text-lg font-bold mb-1 text-gray-700">
          {editingId ? 'Edit Budget' : 'Create New Budget'}
        </h2>
        {!editingId && (
          <p className="text-sm text-gray-400 mb-4">
            Expenses in the same category are automatically tracked against this budget.
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text" placeholder="e.g. Food, Transport, Entertainment"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                // Lock category when editing to avoid mismatching existing expenses
                disabled={!!editingId}
                required
              />
              {editingId && (
                <p className="text-xs text-gray-400 mt-1">Category cannot be changed when editing.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spending Limit ($)</label>
              <input
                type="number" step="0.01" min="1" placeholder="0.00"
                value={formData.limitAmount}
                onChange={e => setFormData({ ...formData, limitAmount: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={formData.timePeriod}
                onChange={e => setFormData({ ...formData, timePeriod: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select period</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date" value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit"
              className="flex-1 bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition">
              {editingId ? 'Update Budget' : 'Create Budget'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel}
                className="flex-1 bg-gray-400 text-white p-3 rounded-lg font-semibold hover:bg-gray-500 transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        {budgets.length === 0 && (
          <div className="text-center py-14 text-gray-400">
            <p className="text-lg mb-1">No budgets yet</p>
            <p className="text-sm">Create your first budget to start tracking spending.</p>
          </div>
        )}

        {/* Render only current page budgets */}
        {paginatedBudgets.map(budget => {
          const percentage = budget.limitAmount > 0
            ? Math.min(100, Math.round((budget.spentAmount / budget.limitAmount) * 100))
            : 0;
          const isExceeded = percentage >= 100;
          const isWarning = percentage >= 80 && percentage < 100;
          const barColor = isExceeded ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500';

          return (
            <div key={budget._id}
              className={`bg-white p-5 shadow-sm rounded-xl mb-3 border-l-4 ${
                isExceeded ? 'border-red-500' : isWarning ? 'border-yellow-500' : 'border-green-500'
              }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-base">{budget.category}</p>
                    <span className="text-purple-600 text-sm">${Number(budget.limitAmount).toFixed(2)} limit</span>
                    {isExceeded && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Exceeded
                      </span>
                    )}
                    {isWarning && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Near limit
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {budget.timePeriod} · Started {new Date(budget.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-1">
                    Spent:{' '}
                    <span className="font-semibold text-red-600">${Number(budget.spentAmount).toFixed(2)}</span>
                    {' '}/ ${Number(budget.limitAmount).toFixed(2)}
                    {' '}· Remaining:{' '}
                    <span className="font-semibold text-green-600">
                      ${Math.max(0, budget.limitAmount - budget.spentAmount).toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(budget)}
                    className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 text-sm font-medium transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(budget._id)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm font-medium transition">
                    Delete
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`h-3 rounded-full ${barColor} transition-all`}
                  style={{ width: `${percentage}%` }} />
              </div>
              <p className="text-xs text-right mt-1 text-gray-400">{percentage}% used</p>
            </div>
          );
        })}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default Budgets;