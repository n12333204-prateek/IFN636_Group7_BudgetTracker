import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Income = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({ amount: '', source: '', date: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchIncome(); }, []);

  const fetchIncome = async () => {
    try {
      const res = await axiosInstance.get('/api/income', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIncomes(res.data);
    } catch (error) {
      alert('Failed to fetch income');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/api/income/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setIncomes(incomes.map(inc => inc._id === editingId ? res.data : inc));
        setEditingId(null);
      } else {
        const res = await axiosInstance.post('/api/income', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setIncomes([...incomes, res.data]);
      }
      setFormData({ amount: '', source: '', date: '', description: '' });
    } catch (error) {
      alert('Failed to save income');
    }
  };

  const handleEdit = (income) => {
    setEditingId(income._id);
    setFormData({
      amount: income.amount,
      source: income.source,
      date: income.date.substring(0, 10),
      description: income.description || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    try {
      await axiosInstance.delete(`/api/income/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIncomes(incomes.filter(inc => inc._id !== id));
    } catch (error) {
      alert('Failed to delete income');
    }
  };

  const totalAmount = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Income Management</h1>

      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          {editingId ? 'Edit Income' : 'Add New Income'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input type="number" placeholder="0.00" value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input type="text" placeholder="e.g. Salary, Freelance, Investment"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input type="text" placeholder="Add a note"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit"
              className="flex-1 bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700">
              {editingId ? 'Update Income' : 'Add Income'}
            </button>
            {editingId && (
              <button type="button"
                onClick={() => { setEditingId(null); setFormData({ amount: '', source: '', date: '', description: '' }); }}
                className="flex-1 bg-gray-400 text-white p-3 rounded-lg font-semibold hover:bg-gray-500">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-4 shadow rounded-lg mb-4 flex justify-between items-center">
        <span className="text-gray-600 font-medium">Total Income</span>
        <span className="text-xl font-bold text-green-600">${totalAmount.toFixed(2)}</span>
      </div>

      <div>
        {incomes.length === 0 && (
          <p className="text-center text-gray-400 py-8">No income records yet. Add one above.</p>
        )}
        {incomes.map(income => (
          <div key={income._id}
            className="bg-white p-4 shadow rounded-lg mb-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">
                {income.source}
                <span className="text-green-600 ml-2">${Number(income.amount).toFixed(2)}</span>
              </p>
              <p className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
              {income.description && (
                <p className="text-sm text-gray-400 mt-1">{income.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(income)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                Edit
              </button>
              <button onClick={() => handleDelete(income._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Income;