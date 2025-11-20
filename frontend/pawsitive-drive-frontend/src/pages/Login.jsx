import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import "../App.css";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            nav('/');
        } catch (e1) {
            const errorMessage = e1.response?.data?.message || e1.message || 'Invalid email or password. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-background">
            <div className="signup-overlay"></div>

            <div className="signup-centered auth-card compact-card">
                <div className="text-center mb-6 auth-header">
                    <h1 className="text-3xl font-bold text-indigo-700">Welcome Back</h1>
                    <p className="text-gray-200 mt-1">Sign in to your Pawsitive Drive account</p>
                </div>
                
                {error && (
                    <div className="flash error-flash">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={submit} className="auth-form space-y-5">
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
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn primary auth-submit w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center text-sm text-gray-200 auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-link">Create one here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
