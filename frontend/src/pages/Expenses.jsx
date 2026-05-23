import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const today = new Date().toISOString().substring(0, 10);
// Show 5 items per page so pagination is clearly visible
const ITEMS_PER_PAGE = 3;

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({ amount: '', category: '', date: today, description: '' });
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [budgetAlert, setBudgetAlert] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchExpenses(); fetchBudgets(); }, []);

  // Go back to page 1 whenever the list length changes
  useEffect(() => { setCurrentPage(1); }, [expenses.length]);

  const fetchExpenses = async () => {
    try {
      const res = await axiosInstance.get('/api/expenses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setExpenses(res.data);
    } catch {
      setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await axiosInstance.get('/api/budgets', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBudgets(res.data);
    } catch {
    }
  };

  // Find the budget that matches the selected category to show remaining amount
  const getSelectedBudget = () => {
    const cat = useCustomCategory ? customCategory : formData.category;
    return budgets.find(b => b.category === cat);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBudgetAlert(null);

    const finalCategory = useCustomCategory ? customCategory : formData.category;
    if (!finalCategory.trim()) {
      setError('Please select or enter a category.');
      return;
    }

    const payload = { ...formData, category: finalCategory };

    try {
      if (editingId) {
        const res = await axiosInstance.put(`/api/expenses/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setExpenses(expenses.map(ex => ex._id === editingId ? res.data : ex));
        setEditingId(null);
        showSuccess('Expense updated successfully!');
      } else {
        const res = await axiosInstance.post('/api/expenses', payload, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setExpenses([res.data, ...expenses]);
        // Show budget warning if returned from backend, otherwise show success
        if (res.data.budgetAlert) {
          setBudgetAlert(res.data.budgetAlert);
        } else {
          showSuccess('Expense added successfully!');
        }
        await fetchBudgets();
      }
      setFormData({ amount: '', category: '', date: today, description: '' });
      setCustomCategory('');
      setUseCustomCategory(false);
    } catch {
      setError('Failed to save expense. Please try again.');
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setBudgetAlert(null);
    setSuccessMsg('');
    const budgetMatch = budgets.find(b => b.category === expense.category);
    if (budgetMatch) {
      setUseCustomCategory(false);
      setFormData({
        amount: expense.amount,
        category: expense.category,
        date: expense.date.substring(0, 10),
        description: expense.description || ''
      });
    } else {
      setUseCustomCategory(true);
      setCustomCategory(expense.category);
      setFormData({
        amount: expense.amount,
        category: '',
        date: expense.date.substring(0, 10),
        description: expense.description || ''
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ amount: '', category: '', date: today, description: '' });
    setCustomCategory('');
    setUseCustomCategory(false);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axiosInstance.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setExpenses(expenses.filter(ex => ex._id !== id));
      await fetchBudgets();
      showSuccess('Expense deleted.');
    } catch {
      setError('Failed to delete expense.');
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const selectedBudget = getSelectedBudget();

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = expenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="text-center mt-20 text-gray-400 text-lg">Loading...</div>;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Expense Management</h1>

      {successMsg && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Budget alert - shown when spending hits 80% or 100% of a category budget */}
      {budgetAlert && (
        <div className={`px-4 py-3 rounded-lg mb-4 border ${
          budgetAlert.type === 'exceeded'
            ? 'bg-red-50 border-red-300 text-red-700'
            : 'bg-yellow-50 border-yellow-300 text-yellow-800'
        }`}>
          <p className="font-semibold text-sm mb-1">
            {budgetAlert.type === 'exceeded' ? '⚠️ Budget Exceeded' : '⚠️ Budget Warning'}
          </p>
          <p className="text-sm">{budgetAlert.message}</p>
          <button
            onClick={() => { setBudgetAlert(null); showSuccess('Expense added successfully!'); }}
            className="text-xs underline mt-1 opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Add / Edit form */}
      <div className="bg-white p-6 shadow-sm rounded-xl mb-6">
        <h2 className="text-lg font-bold mb-4 text-gray-700">
          {editingId ? 'Edit Expense' : 'Add New Expense'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              {/* Show dropdown with budget categories if budgets exist */}
              {budgets.length > 0 && !useCustomCategory ? (
                <select
                  value={formData.category}
                  onChange={e => {
                    if (e.target.value === '__other__') {
                      setUseCustomCategory(true);
                      setFormData({ ...formData, category: '' });
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required={!useCustomCategory}
                >
                  <option value="">Select a category</option>
                  {budgets.map(b => (
                    <option key={b._id} value={b.category}>{b.category}</option>
                  ))}
                  <option value="__other__">Other (custom)</option>
                </select>
              ) : (
                <div>
                  <input
                    type="text" placeholder="e.g. Food, Transport, Health"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  {budgets.length > 0 && (
                    <button type="button"
                      onClick={() => { setUseCustomCategory(false); setCustomCategory(''); }}
                      className="text-xs text-blue-500 hover:underline mt-1">
                      ← Back to budget categories
                    </button>
                  )}
                </div>
              )}
              {/* Show remaining budget for selected category */}
              {selectedBudget && (
                <p className={`text-xs mt-1 font-medium ${
                  (selectedBudget.spentAmount / selectedBudget.limitAmount) >= 1
                    ? 'text-red-600'
                    : (selectedBudget.spentAmount / selectedBudget.limitAmount) >= 0.8
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {selectedBudget.category} budget: $
                  {Math.max(0, selectedBudget.limitAmount - selectedBudget.spentAmount).toFixed(2)} remaining
                  of ${Number(selectedBudget.limitAmount).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              {/* max={today} prevents selecting future dates for expenses */}
              <input
                type="date" value={formData.date} max={today}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
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
              className="flex-1 bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600 transition">
              {editingId ? 'Update Expense' : 'Add Expense'}
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

      {/* Total bar */}
      <div className="bg-white p-4 shadow-sm rounded-xl mb-4 flex justify-between items-center">
        <span className="text-gray-600 font-medium">
          Total Expenses
          {expenses.length > 0 && (
            <span className="text-gray-400 font-normal ml-2">({expenses.length} records)</span>
          )}
        </span>
        <span className="text-xl font-bold text-red-600">${totalAmount.toFixed(2)}</span>
      </div>

      {/* Expense list - shows only current page items */}
      <div>
        {expenses.length === 0 && (
          <div className="text-center py-14 text-gray-400">
            <p className="text-lg mb-1">No expenses yet</p>
            <p className="text-sm">Add your first expense using the form above.</p>
          </div>
        )}

        {paginatedExpenses.map(expense => (
          <div key={expense._id}
            className="bg-white p-4 shadow-sm rounded-xl mb-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">
                {expense.category}
                <span className="text-red-600 ml-2">${Number(expense.amount).toFixed(2)}</span>
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date(expense.date).toLocaleDateString()}
              </p>
              {expense.description && (
                <p className="text-sm text-gray-400 mt-1">{expense.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(expense)}
                className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 text-sm font-medium transition">
                Edit
              </button>
              <button onClick={() => handleDelete(expense._id)}
                className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm font-medium transition">
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Pagination - only renders when there is more than one page */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Expenses;