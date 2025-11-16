import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function Login() {
    // Get the login function from AuthContext
    const { login } = useAuth();
    
    // Hooks for navigation, state, error handling, and loading status
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
            // Attempt to log in using the function provided by AuthContext
            await login(email, password);
            
            // Navigate to the home page upon successful login
            nav('/');
        } catch (e1) {
            // Handle login errors (e.g., invalid credentials from the backend)
            const errorMessage = e1.response?.data?.message || e1.message || 'Invalid email or password. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md auth-card">
                <div className="text-center mb-8 auth-header">
                    <h1 className="text-3xl font-bold text-indigo-700">Welcome Back</h1>
                    <p className="text-gray-500 mt-1">Sign in to your Pawsitive Drive account</p>
                </div>
                
                {/* Error Display */}
                {error && (
                    <div className="p-4 mb-4 rounded-lg text-red-700 bg-red-100 font-medium border border-red-200 flash error-flash">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6 auth-form">
                    <div className="form-group">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 form-input"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 form-input"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn bg-indigo-600 text-white hover:bg-indigo-700 w-full py-2.5 rounded-lg text-lg font-semibold transition duration-300 primary auth-submit" 
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center space-x-2">
                                {/* Simple spinner representation, replace with actual CSS animation if needed */}
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Signing in...</span>
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium auth-link">Create one here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
