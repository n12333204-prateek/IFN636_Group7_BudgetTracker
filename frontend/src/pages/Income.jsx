import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const today = new Date().toISOString().substring(0, 10);
const ITEMS_PER_PAGE = 3;

const Income = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({
    amount: '', source: '', date: today, frequency: 'One-time', description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchIncome(); }, []);
  useEffect(() => { setCurrentPage(1); }, [incomes.length]);

  const fetchIncome = async () => {
    try {
      const res = await axiosInstance.get('/api/income', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIncomes(res.data);
    } catch {
      setError('Failed to load income records.');
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
        const res = await axiosInstance.put(`/api/income/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setIncomes(incomes.map(inc => inc._id === editingId ? res.data : inc));
        setEditingId(null);
        showSuccess('Income record updated successfully!');
      } else {
        const res = await axiosInstance.post('/api/income', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setIncomes([res.data, ...incomes]);
        showSuccess('Income record added successfully!');
      }
      setFormData({ amount: '', source: '', date: today, frequency: 'One-time', description: '' });
    } catch {
      setError('Failed to save income record. Please try again.');
    }
  };

  const handleEdit = (income) => {
    setEditingId(income._id);
    setFormData({
      amount: income.amount,
      source: income.source,
      date: income.date.substring(0, 10),
      frequency: income.frequency || 'One-time',
      description: income.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ amount: '', source: '', date: today, frequency: 'One-time', description: '' });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    try {
      await axiosInstance.delete(`/api/income/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIncomes(incomes.filter(inc => inc._id !== id));
      showSuccess('Income record deleted.');
    } catch {
      setError('Failed to delete income record.');
    }
  };

  const totalAmount = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  // Pagination
  const totalPages = Math.ceil(incomes.length / ITEMS_PER_PAGE);
  const paginatedIncomes = incomes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Color badge for income frequency type
  const frequencyBadge = (freq) => {
    const colors = {
      Monthly: 'bg-blue-100 text-blue-700',
      Weekly: 'bg-purple-100 text-purple-700',
      Fortnightly: 'bg-indigo-100 text-indigo-700',
      'One-time': 'bg-gray-100 text-gray-600'
    };
    return colors[freq] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <div className="text-center mt-20 text-gray-400 text-lg">Loading...</div>;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Income Management</h1>

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
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          {editingId ? 'Edit Income Record' : 'Add New Income'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input
                type="number" step="0.01" min="0.01" placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input
                type="text" placeholder="e.g. Salary, Freelance, Investment"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
              <input
                type="date" value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="One-time">One-time</option>
                <option value="Weekly">Weekly</option>
                <option value="Fortnightly">Fortnightly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text" placeholder="Add a note"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit"
              className="flex-1 bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition">
              {editingId ? 'Update Income' : 'Add Income'}
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

      <div className="bg-white p-4 shadow-sm rounded-xl mb-4 flex justify-between items-center">
        <span className="text-gray-600 font-medium">
          Total Income
          {incomes.length > 0 && (
            <span className="text-gray-400 font-normal ml-2">({incomes.length} records)</span>
          )}
        </span>
        <span className="text-xl font-bold text-green-600">${totalAmount.toFixed(2)}</span>
      </div>

      <div>
        {incomes.length === 0 && (
          <div className="text-center py-14 text-gray-400">
            <p className="text-lg mb-1">No income records yet</p>
            <p className="text-sm">Add your first income source using the form above.</p>
          </div>
        )}

        {/* Render only the current page items */}
        {paginatedIncomes.map(income => (
          <div key={income._id}
            className="bg-white p-4 shadow-sm rounded-xl mb-3 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-800">{income.source}</p>
                <span className="text-green-600 font-semibold">${Number(income.amount).toFixed(2)}</span>
                {income.frequency && income.frequency !== 'One-time' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${frequencyBadge(income.frequency)}`}>
                    {income.frequency}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date(income.date).toLocaleDateString()}
              </p>
              {income.description && (
                <p className="text-sm text-gray-400 mt-1">{income.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(income)}
                className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 text-sm font-medium transition">
                Edit
              </button>
              <button onClick={() => handleDelete(income._id)}
                className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm font-medium transition">
                Delete
              </button>
            </div>
          </div>
        ))}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default Income;