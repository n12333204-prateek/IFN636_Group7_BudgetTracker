import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';

// Show 10 users per page in the admin table
const ITEMS_PER_PAGE = 5;

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Redirect non-admin users away immediately
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user]);

  // Reset to first page if user count changes (after delete)
  useEffect(() => { setCurrentPage(1); }, [users.length]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(res.data);
    } catch {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axiosInstance.put(
        `/api/admin/users/${userId}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      showSuccess(`User has been ${!currentStatus ? 'activated' : 'deactivated'}.`);
    } catch {
      setError('Failed to update user status.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(users.filter(u => u._id !== userId));
      showSuccess('User deleted successfully.');
    } catch {
      setError('Failed to delete user.');
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-400 text-lg">Loading...</div>;

  // Stats only count regular users, not admin accounts
  const regularUsers = users.filter(u => u.role === 'user');
  const activeUsers = regularUsers.filter(u => u.isActive).length;
  const inactiveUsers = regularUsers.filter(u => !u.isActive).length;

  // Pagination - slice the user list for the current page
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full max-w-screen-xl mx-auto px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage all registered users</p>
      </div>

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

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 shadow-sm rounded-xl border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Total Users</p>
          <p className="text-3xl font-bold text-gray-800">{regularUsers.length}</p>
        </div>
        <div className="bg-white p-6 shadow-sm rounded-xl border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Active Users</p>
          <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-white p-6 shadow-sm rounded-xl border-l-4 border-red-500">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Inactive Users</p>
          <p className="text-3xl font-bold text-red-600">{inactiveUsers}</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-700">Registered Users</h2>
          {/* Show record range for context */}
          {users.length > 0 && (
            <span className="text-sm text-gray-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, users.length)} of {users.length} users
            </span>
          )}
        </div>

        {users.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No users found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-semibold">Name</th>
                    <th className="text-left p-4 text-gray-600 font-semibold">Email</th>
                    <th className="text-left p-4 text-gray-600 font-semibold">Role</th>
                    <th className="text-left p-4 text-gray-600 font-semibold">Status</th>
                    <th className="text-left p-4 text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Only render current page users */}
                  {paginatedUsers.map(u => (
                    <tr key={u._id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800">{u.name}</td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        {/* Admin accounts are protected - cannot be deactivated or deleted */}
                        {u.role !== 'admin' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleStatus(u._id, u.isActive)}
                              className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition ${
                                u.isActive
                                  ? 'bg-yellow-500 hover:bg-yellow-600'
                                  : 'bg-green-500 hover:bg-green-600'
                              }`}>
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(u._id)}
                              className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-red-500 hover:bg-red-600 transition">
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination sits inside the white card, below the table */}
            <div className="px-5 pb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;