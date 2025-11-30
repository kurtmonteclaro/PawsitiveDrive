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

  const getLinkClassName = (path) => {
    const isActive = location.pathname === path;
    let className = 'nav-link';
    if (isActive) {
      className += path === '/donate' ? ' donation-highlight' : ' active-link';
    }
    if (path === '/admin' && role === 'Admin') {
      className += ' admin-link';
    }
    return className;
  };

  return (
      <nav className={`topnav site-header ${isHome ? 'navbar-glass' : ''}`}>
        <Link to="/" className="navbar-brand">
          <img src="/pawsitivedrive.png" alt="Pawsitive Drive" className="brand-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="brand-text">PAWSITIVE DRIVE</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={getLinkClassName('/')}>Home</Link>
          <Link to="/about" className={getLinkClassName('/about')}>About</Link>
          <Link to="/adopt" className={getLinkClassName('/adopt')}>Adopt</Link>
          <Link to="/donate" className={getLinkClassName('/donate')}>Donate</Link>
          <Link to="/contact" className={getLinkClassName('/contact')}>Contact</Link>
          {role === 'Admin' && <Link to="/admin" className={getLinkClassName('/admin')}>Dashboard</Link>}
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
            <Route path="/about" element={<About />} />
            <Route path="/adopt" element={<Adopt />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/contact" element={<Contact />} />
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
