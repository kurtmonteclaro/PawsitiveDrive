import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Adopt from './pages/Adopt';
import Donate from './pages/Donate';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import { UserRoleProvider, useUserRole } from './context/UserRoleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useLocation } from 'react-router-dom';

const API_ROOT = process.env.REACT_APP_API_BASE ?? 'http://localhost:8080/api';

function Navbar() {
  const { role } = useUserRole();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const loadProfilePicture = async () => {
      if (!user?.user_id && !user?.id) {
        setProfilePicture(null);
        return;
      }

      try {
        const userId = user.user_id || user.id;
        const res = await axios.get(`${API_ROOT}/profiles/user/${userId}`);
        console.log("Navbar - Full profile response:", res.data);
        const pictureUrl = res.data?.profile_picture;
        console.log("Navbar - Profile picture URL extracted:", pictureUrl);
        console.log("Navbar - Profile picture type:", typeof pictureUrl);
        console.log("Navbar - Profile picture length:", pictureUrl?.length);
        
        // Check if pictureUrl exists and is not empty
        if (pictureUrl && typeof pictureUrl === 'string' && pictureUrl.trim() !== "") {
          console.log("Navbar - Setting profile picture:", pictureUrl);
          setProfilePicture(pictureUrl.trim());
        } else {
          console.log("Navbar - No valid profile picture, setting to null");
          setProfilePicture(null);
        }
      } catch (err) {
        // Profile doesn't exist or error - set to null
        console.log("Navbar - Profile not found or error:", err.response?.status, err.response?.data);
        setProfilePicture(null);
      }
    };

    if (user) {
      loadProfilePicture();
    } else {
      setProfilePicture(null);
    }
  }, [user, location.pathname]); // Reload when navigating to profile page

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
          {user && <>
            <Link to="/profile" className={`profile-link ${getLinkClassName('/profile')}`}>
              {profilePicture && profilePicture.trim() !== "" ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="navbar-profile-picture"
                  onError={(e) => {
                    console.log("Navbar - Image failed to load:", profilePicture);
                    // If image fails to load, hide image and show icon
                    e.target.style.display = 'none';
                    const icon = e.target.parentElement.querySelector('.navbar-profile-icon');
                    if (icon) icon.style.display = 'flex';
                  }}
                  onLoad={() => {
                    console.log("Navbar - Image loaded successfully:", profilePicture);
                  }}
                />
              ) : null}
              <svg 
                className="navbar-profile-icon" 
                style={{ display: profilePicture && profilePicture.trim() !== "" ? 'none' : 'flex' }}
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <button className="auth-btn logout-btn" onClick={logout}>Logout</button>
          </>}
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
            <Route path="/profile" element={<div className="container"><Profile /></div>} />
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
