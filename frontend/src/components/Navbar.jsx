import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  };

  // Highlights the link for the current active page
  const navLink = (to, label) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition px-3 py-2 rounded-lg ${
          isActive
            ? 'bg-white bg-opacity-20 text-white'
            : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      style={{ backgroundColor: '#1E3A5F' }}
      className="text-white px-8 py-4 flex justify-between items-center shadow-lg"
    >
      <Link
        to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
        className="text-2xl font-bold tracking-tight text-white"
      >
        BudgetTracker
      </Link>

      <div className="flex items-center gap-1">
        {user ? (
          <>
            {user.role === 'admin' ? (
              navLink('/admin', 'Admin Panel')
            ) : (
              <>
                {navLink('/dashboard', 'Dashboard')}
                {navLink('/expenses', 'Expenses')}
                {navLink('/income', 'Income')}
                {navLink('/budgets', 'Budgets')}
                {navLink('/savings', 'Savings')}
                {navLink('/profile', 'Profile')}
              </>
            )}
            <button
              onClick={handleLogout}
              className="ml-3 bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"
              className="text-sm font-medium text-blue-100 hover:text-white transition px-3 py-2">
              Login
            </Link>
            <Link to="/register"
              className="ml-1 bg-green-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;