import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Adopt from './pages/Adopt';
import Donate from './pages/Donate';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import { UserRoleProvider, useUserRole } from './context/UserRoleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useLocation } from 'react-router-dom';

function Navbar() {
  const { role } = useUserRole();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
      <nav className={`topnav site-header ${isHome ? 'navbar-glass' : ''}`}>
        <Link to="/" className="navbar-brand">
          <img src="/pawsitivedrive.png" alt="Pawsitive Drive" className="brand-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="brand-text">PAWSITIVE DRIVE</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/adopt" className="nav-link">Adopt</Link>
          <Link to="/donate" className="nav-link donation-highlight">Donate</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {role === 'Admin' && <Link to="/admin" className="nav-link admin-link">Dashboard</Link>}
        </div>
        <div className="navbar-auth">
          {!user && <>
            <Link to="/login" className="nav-link">Sign in</Link>
            <Link to="/signup" className="auth-btn signup-btn">Get Started</Link>
          </>}
          {user && <button className="auth-btn logout-btn" onClick={logout}>Logout</button>}
        </div>
      </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserRoleProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<div className="container"><About /></div>} />
            <Route path="/adopt" element={<div className="container"><Adopt /></div>} />
            <Route path="/donate" element={<div className="container"><Donate /></div>} />
            <Route path="/contact" element={<div className="container"><Contact /></div>} />
            <Route path="/admin" element={<div className="container"><AdminDashboard /></div>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <footer className="footer">© {new Date().getFullYear()} Pawsitive Drive</footer>
        </UserRoleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
