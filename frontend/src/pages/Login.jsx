import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      // Redirect based on role
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Shows exact server message - handles deactivated accounts specifically
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
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
        <p className="text-gray-500 mt-1 text-sm">Take control of your personal finances</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-200 px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to your account to continue</p>

        {/* Deactivated account gets orange, all other errors get red */}
        {error && (
          <div className={`px-4 py-3 rounded-lg mb-5 text-sm font-medium ${
            error.includes('deactivated')
              ? 'bg-orange-50 border border-orange-300 text-orange-700'
              : 'bg-red-50 border border-red-300 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white p-3 rounded-lg font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          New to BudgetTracker?{' '}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: '#2563EB' }}>
            Create an account
          </Link>
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
        {['Track income & expenses', 'Set spending budgets', 'Monitor savings goals'].map(f => (
          <span key={f} className="text-sm text-gray-500 flex items-center gap-1.5">
            <span className="font-bold" style={{ color: '#1E3A5F' }}>✓</span> {f}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Login;