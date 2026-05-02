import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', occupation: '', address: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          occupation: response.data.occupation || '',
          address: response.data.address || ''
        });
      } catch (error) {
        alert('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading profile...</div>;

  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 flex items-center gap-4" style={{ backgroundColor: '#1E3A5F' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center
            text-white text-2xl font-bold border-2 border-white"
            style={{ backgroundColor: '#2563EB' }}>
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{formData.name}</h2>
            <p className="text-blue-200 text-sm">{formData.email}</p>
            {formData.occupation && (
              <p className="text-blue-300 text-sm mt-1">{formData.occupation}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input type="text" placeholder="e.g. Software Engineer"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" placeholder="e.g. Brisbane, QLD"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full text-white p-3 rounded-lg font-semibold hover:opacity-90"
            style={{ backgroundColor: '#1E3A5F' }}>
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <button onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg
          font-semibold hover:bg-red-100 transition">
        Logout
      </button>
    </div>
  );
};

export default Profile;