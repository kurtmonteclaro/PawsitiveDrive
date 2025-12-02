import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import "../App.css";
import "./Signup.css";

const getRoleName = (user) => {
  if (!user) return null;
  const rawName = user.role?.role_name || user.role_name || user.role?.roleName || user.roleName;
  return rawName ? String(rawName).trim() : null;
};

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState(''); 
  const [contact, setContact] = useState(''); 
  const [role, setRole] = useState('Donor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prevent page scrolling while on the signup screen
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const newUser = await signup(name, email, password, role, address, contact);
      const roleName = getRoleName(newUser) || role;
      nav(roleName?.toLowerCase() === 'admin' ? '/admin' : '/');
    } catch (e1) {
      console.error('SIGNUP ERROR:', e1);
      const message = e1.response?.data?.message || e1.message || 'Registration failed. Please check your information and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-background">
      <div className="signup-overlay"></div>

      <div className="signup-centered auth-card compact-card">
        <div className="auth-header">
          <h1>Create Your Account</h1>
          <p>Join Pawsitive Drive and make a difference</p>
        </div>

        {error && (
          <div className="flash error-flash">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Create a password"
              minLength="6"
            />
            <small className="form-hint">Minimum 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Number</label>
            <input
              type="tel" 
              id="contact"
              value={contact}
              onChange={e => setContact(e.target.value)}
              required
              className="form-input"
              placeholder="e.g., 09xxxxxxxxx"
              pattern="[0-9]{11}"
            />
            <small className="form-hint">Must be a valid 11-digit phone number</small>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              className="form-input"
              placeholder="Enter your street address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="form-input"
            >
              <option value="Donor">Donor - Support our mission</option>
              <option value="Admin">Admin - Manage the platform</option>
            </select>
            <small className="form-hint">
              {role === 'Donor' 
                ? 'As a donor, you can support pets through donations' 
                : 'Admin accounts can create pet posts and manage the platform'}
            </small>
          </div>

          <button 
            type="submit" 
            className="btn primary auth-submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
