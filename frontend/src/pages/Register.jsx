import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/register', formData);
      // Go to login and let it know the account was just created
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-12">

      {/* App name above the card */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>BudgetTracker</h1>
        <p className="text-gray-500 mt-1 text-sm">Start managing your finances today</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-200 px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
        <p className="text-gray-400 text-sm mb-6">Join now to manage finances smarter</p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-7">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              minLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white p-3 rounded-lg font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: '#2563EB' }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Feature hints - visible on gray-100 background */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
        {['Budget alerts', 'Savings goal tracking', 'Income & expense history'].map(f => (
          <span key={f} className="text-sm text-gray-500 flex items-center gap-1.5">
            <span className="font-bold" style={{ color: '#1E3A5F' }}>✓</span> {f}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Register;
