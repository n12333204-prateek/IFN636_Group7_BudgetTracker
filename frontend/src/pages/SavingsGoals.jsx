import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const today = new Date().toISOString().substring(0, 10);
const ITEMS_PER_PAGE = 3;

const SavingsGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({ goalName: '', targetAmount: '', targetDate: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [contributingId, setContributingId] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchGoals(); }, []);
  useEffect(() => { setCurrentPage(1); }, [goals.length]);

  const fetchGoals = async () => {
    try {
      const res = await axiosInstance.get('/api/savings', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGoals(res.data);
    } catch {
      setError('Failed to load savings goals.');
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
        const res = await axiosInstance.put(`/api/savings/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setGoals(goals.map(g => g._id === editingId ? res.data : g));
        setEditingId(null);
        showSuccess('Goal updated successfully!');
      } else {
        const res = await axiosInstance.post('/api/savings', formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setGoals([...goals, res.data]);
        showSuccess('Savings goal created successfully!');
      }
      setFormData({ goalName: '', targetAmount: '', targetDate: '', notes: '' });
    } catch {
      setError('Failed to save goal. Please try again.');
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal._id);
    setContributingId(null);
    setFormData({
      goalName: goal.goalName,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate.substring(0, 10),
      notes: goal.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ goalName: '', targetAmount: '', targetDate: '', notes: '' });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await axiosInstance.delete(`/api/savings/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGoals(goals.filter(g => g._id !== id));
      showSuccess('Goal deleted.');
    } catch {
      setError('Failed to delete goal.');
    }
  };

  const handleContribute = async (goalId) => {
    if (!contributionAmount || Number(contributionAmount) <= 0) {
      setError('Please enter a valid contribution amount.');
      return;
    }
    setError('');
    try {
      const res = await axiosInstance.put(
        `/api/savings/${goalId}/contribute`,
        { amount: contributionAmount },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setGoals(goals.map(g => g._id === goalId ? res.data : g));
      setContributingId(null);
      setContributionAmount('');
      // Special message if goal is now 100% complete
      if (res.data.savedAmount >= res.data.targetAmount) {
        showSuccess(`🎉 Goal "${res.data.goalName}" is now complete!`);
      } else {
        showSuccess('Contribution added successfully!');
      }
    } catch {
      setError('Failed to add contribution. Please try again.');
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);

  // Pagination
  const totalPages = Math.ceil(goals.length / ITEMS_PER_PAGE);
  const paginatedGoals = goals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="text-center mt-20 text-gray-400 text-lg">Loading...</div>;

  return (
    <div className="w-full max-w-screen-xl mx-auto px-8 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Savings Goals</h1>

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
          {editingId ? 'Edit Goal' : 'Create New Goal'}
        </h2>
        {!editingId && (
          <p className="text-sm text-gray-400 mb-4">
            Set a target, track your progress, and add contributions over time.
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
              <input
                type="text" placeholder="e.g. Emergency Fund, Holiday, New Laptop"
                value={formData.goalName}
                onChange={e => setFormData({ ...formData, goalName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($)</label>
              <input
                type="number" step="0.01" min="1" placeholder="0.00"
                value={formData.targetAmount}
                onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              {/* min={today} prevents setting a past date as the savings target */}
              <input
                type="date" value={formData.targetDate} min={today}
                onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text" placeholder="Why are you saving for this?"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit"
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              {editingId ? 'Update Goal' : 'Create Goal'}
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

      {goals.length > 0 && (
        <div className="bg-white p-4 shadow-sm rounded-xl mb-4 flex justify-between items-center">
          <span className="text-gray-600 font-medium">Total Saved</span>
          <span className="text-xl font-bold text-blue-600">
            ${totalSaved.toFixed(2)}{' '}
            <span className="text-sm text-gray-400 font-normal">of ${totalTarget.toFixed(2)}</span>
          </span>
        </div>
      )}

      <div>
        {goals.length === 0 && (
          <div className="text-center py-14 text-gray-400">
            <p className="text-lg mb-1">No savings goals yet</p>
            <p className="text-sm">Create your first goal to start saving.</p>
          </div>
        )}

        {/* Render only current page goals */}
        {paginatedGoals.map(goal => {
          const pct = goal.targetAmount > 0
            ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
            : 0;
          const isComplete = pct >= 100;
          const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal._id}
              className={`bg-white p-5 shadow-sm rounded-xl mb-3 border-l-4 ${
                isComplete ? 'border-green-500' : 'border-blue-400'
              }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-base">{goal.goalName}</p>
                    {isComplete && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Complete ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                    {!isComplete && daysLeft > 0 && (
                      <span className={`ml-2 ${daysLeft <= 30 ? 'text-orange-500' : 'text-gray-400'}`}>
                        · {daysLeft} days left
                      </span>
                    )}
                    {!isComplete && daysLeft <= 0 && (
                      <span className="ml-2 text-red-500">· Past due</span>
                    )}
                  </p>
                  <p className="text-sm mt-1">
                    Saved:{' '}
                    <span className="font-semibold text-blue-600">${Number(goal.savedAmount).toFixed(2)}</span>
                    {' '}/ ${Number(goal.targetAmount).toFixed(2)}
                    {' '}· Remaining:{' '}
                    <span className="font-semibold text-gray-600">
                      ${Math.max(0, goal.targetAmount - goal.savedAmount).toFixed(2)}
                    </span>
                  </p>
                  {goal.notes && (
                    <p className="text-sm text-gray-400 mt-1 italic">{goal.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4 flex-wrap justify-end">
                  {!isComplete && (
                    <button
                      onClick={() => {
                        setContributingId(contributingId === goal._id ? null : goal._id);
                        setContributionAmount('');
                        setError('');
                      }}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 text-sm font-medium transition">
                      + Add
                    </button>
                  )}
                  <button onClick={() => handleEdit(goal)}
                    className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 text-sm font-medium transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(goal._id)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm font-medium transition">
                    Delete
                  </button>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                <div
                  className={`h-3 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-right text-gray-400 mb-2">{pct}% of goal reached</p>

              {/* Inline contribution form - expands on clicking + Add */}
              {contributingId === goal._id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Add a contribution</p>
                  <div className="flex gap-2">
                    <input
                      type="number" step="0.01" min="0.01" placeholder="Amount ($)"
                      value={contributionAmount}
                      onChange={e => setContributionAmount(e.target.value)}
                      className="flex-1 p-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button onClick={() => handleContribute(goal._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                      Save
                    </button>
                    <button onClick={() => { setContributingId(null); setContributionAmount(''); }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default SavingsGoals;