import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(res.data);
    } catch (error) {
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axiosInstance.put(
        `/api/admin/users/${userId}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUsers(users.map(u =>
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;

  const regularUsers = users.filter(u => u.role === 'user');
  const totalUsers = regularUsers.length;
  const activeUsers = regularUsers.filter(u => u.isActive).length;
  const inactiveUsers = regularUsers.filter(u => !u.isActive).length;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage all registered users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-800">{totalUsers}</p>
        </div>
        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Active Users</p>
          <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-red-500">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Inactive Users</p>
          <p className="text-3xl font-bold text-red-600">{inactiveUsers}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-700">Registered Users</h2>
        </div>

        {users.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No users found.</p>
        ) : (
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
                {users.map(u => (
                  <tr key={u._id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{u.name}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${u.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.role !== 'admin' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                            className={`px-3 py-1 rounded text-white text-xs font-medium
                              ${u.isActive
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-green-500 hover:bg-green-600'}`}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="px-3 py-1 rounded text-white text-xs font-medium
                              bg-red-500 hover:bg-red-600">
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;