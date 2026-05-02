import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ amount: '', category: '', date: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axiosInstance.get('/api/expenses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setExpenses(res.data);
    } catch (error) {
      alert('Failed to fetch expenses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/api/expenses/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setExpenses(expenses.map(ex => ex._id === editingId ? res.data : ex));
        setEditingId(null);
      } else {
        const res = await axiosInstance.post('/api/expenses', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setExpenses([...expenses, res.data]);
      }
      setFormData({ amount: '', category: '', date: '', description: '' });
    } catch (error) {
      alert('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setFormData({
      amount: expense.amount,
      category: expense.category,
      date: expense.date.substring(0, 10),
      description: expense.description || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axiosInstance.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setExpenses(expenses.filter(ex => ex._id !== id));
    } catch (error) {
      alert('Failed to delete expense');
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Expense Management</h1>

      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          {editingId ? 'Edit Expense' : 'Add New Expense'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" placeholder="e.g. Food, Transport, Health"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
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
              className="flex-1 bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600">
              {editingId ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingId && (
              <button type="button"
                onClick={() => { setEditingId(null); setFormData({ amount: '', category: '', date: '', description: '' }); }}
                className="flex-1 bg-gray-400 text-white p-3 rounded-lg font-semibold hover:bg-gray-500">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-4 shadow rounded-lg mb-4 flex justify-between items-center">
        <span className="text-gray-600 font-medium">Total Expenses</span>
        <span className="text-xl font-bold text-red-600">${totalAmount.toFixed(2)}</span>
      </div>

      <div>
        {expenses.length === 0 && (
          <p className="text-center text-gray-400 py-8">No expenses yet. Add one above.</p>
        )}
        {expenses.map(expense => (
          <div key={expense._id}
            className="bg-white p-4 shadow rounded-lg mb-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">
                {expense.category}
                <span className="text-red-600 ml-2">${Number(expense.amount).toFixed(2)}</span>
              </p>
              <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
              {expense.description && (
                <p className="text-sm text-gray-400 mt-1">{expense.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(expense)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                Edit
              </button>
              <button onClick={() => handleDelete(expense._id)}
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

export default Expenses;