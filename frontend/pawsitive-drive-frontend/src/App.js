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

function Navbar() {
  const { role } = useUserRole();
  const { user, logout } = useAuth();
  return (
      <nav className="topnav">
        <div className="brand">
          <img src="/pawsitivedrive.png" alt="Pawsitive Drive" className="brand-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <span>PAWSITIVE DRIVE</span>
        </div>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/about">About us</Link>
          <Link to="/adopt">Adopt</Link>
          <Link to="/donate">Donate</Link>
          <Link to="/contact">Contact us</Link>
          {role === 'Admin' && <Link to="/admin">Admin</Link>}
          {!user && <>
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Sign up</Link>
          </>}
          {user && <button className="btn small" onClick={logout}>Logout</button>}
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
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} Pawsitive Drive</footer>
        </UserRoleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
