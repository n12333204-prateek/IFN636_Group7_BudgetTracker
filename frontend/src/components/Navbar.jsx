import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav style={{ backgroundColor: '#1E3A5F' }}
      className="text-white p-4 flex justify-between items-center shadow-md">
      <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
        className="text-2xl font-bold tracking-tight">
        BudgetTracker
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {user.role === 'admin' ? (
              <Link to="/admin"
                className="text-sm hover:text-blue-300 transition">
                Admin Panel
              </Link>
            ) : (
              <>
                <Link to="/dashboard" className="text-sm hover:text-blue-300 transition">
                  Dashboard
                </Link>
                <Link to="/expenses" className="text-sm hover:text-blue-300 transition">
                  Expenses
                </Link>
                <Link to="/income" className="text-sm hover:text-blue-300 transition">
                  Income
                </Link>
                <Link to="/budgets" className="text-sm hover:text-blue-300 transition">
                  Budgets
                </Link>
                <Link to="/profile" className="text-sm hover:text-blue-300 transition">
                  Profile
                </Link>
              </>
            )}
            <button onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded text-sm hover:bg-red-600 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm hover:text-blue-300 transition">
              Login
            </Link>
            <Link to="/register"
              className="bg-green-500 px-4 py-2 rounded text-sm hover:bg-green-600 transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;