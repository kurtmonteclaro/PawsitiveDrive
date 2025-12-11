import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { useLocation } from 'react-router-dom';
import "./Donate.css";

const API_ROOT = process.env.REACT_APP_API_BASE ?? 'http://localhost:8080/api';

export default function Donate() {
    // Default starting amount, using 500 as the user's initial state
    const [amount, setAmount] = useState(500);
    const [status, setStatus] = useState('');
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(false); // Added loading state for submit button
    
    const location = useLocation();
    const { user } = useAuth();

    // Effect to load pet details if petId is present in URL query parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const petId = params.get('petId');
        
        if (petId) {
            // Load pet details
            axios.get(`${API_ROOT}/pets/${petId}`)
                .then(res => setPet(res.data))
                .catch(err => {
                    console.error('Failed to load pet:', err);
                    setPet({ pet_id: petId, name: 'Unknown Pet' }); // Fallback data
                });
        }
    }, [location.search]);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('Processing…');

        // Basic validation
        if (amount <= 0 || isNaN(amount)) {
            setStatus('Please enter a valid donation amount.');
            setLoading(false);
            return;
        }

        try {
            let donationData = {
                amount: amount,
                payment_method: 'Manual', // Assuming manual or mock payment for now
                status: 'Completed' // Assuming immediate completion for mock payment
            };

            // 1. If a user is logged in, attach user details to the donation
            if (user) {
                // Fetch full user object to ensure entity mapping works on backend
                const userId = user.user_id || user.id;
                if (userId) {
                    const userRes = await axios.get(`${API_ROOT}/users/${userId}`);
                    donationData.user = userRes.data;
                }
            }

            // 2. If donating to a specific pet, fetch full pet object and include pet reference
            if (pet && pet.pet_id) {
                try {
                    const petRes = await axios.get(`${API_ROOT}/pets/${pet.pet_id}`);
                    donationData.pet = petRes.data;
                } catch (err) {
                    console.error('Failed to fetch full pet object:', err);
                    // Use the pet data we already have
                    donationData.pet = pet;
                }
            }

            // 3. Post donation data
            const res = await axios.post(`${API_ROOT}/donations`, donationData);
            
            if (res.status === 201 || res.status === 200) {
                setStatus(`Thank you for your donation of ₱${amount.toLocaleString()}! ${pet ? `Your contribution will help ${pet.name} find a loving home.` : 'Your generosity is highly appreciated!'}`);
                setAmount(500); // Reset amount
                
                // If specific pet donation, redirect back to the adopt page after confirmation
                if (pet) {
                    setTimeout(() => {
                        window.location.href = '/adopt'; // Redirect to Adopt page
                    }, 3000);
                }
            } else {
                setStatus('Something went wrong with the server.');
            }
        } catch (err) {
            console.error('Donation error:', err);
            setStatus('Failed to process donation. Please try again.');
        } finally {
            setLoading(false);
            setTimeout(() => setStatus(''), pet ? 3000 : 5000); // Clear status unless redirecting
        }
    };

    return (
        <div className="container">
            <div className="page-header text-center mb-8">
                <h2 className="section-title">Make a Donation</h2>
                <p className="section-subtitle">Your contribution helps us care for pets and find them loving homes</p>
            </div>

            {/* Pet Specific Donation Card */}
            {pet && (
                <div className="bg-white rounded-xl shadow-lg border border-indigo-200 mb-8 max-w-lg mx-auto">
                    <div className="flex items-center gap-4 p-5">
                        {/* Pet Image */}
                        <div className="flex-shrink-0">
                            <img 
                                src={pet.image_url} 
                                alt={pet.name}
                                className="w-24 h-24 object-cover rounded-xl"
                                onError={(e) => { 
                                  e.target.style.display = 'none'; 
                                  e.target.parentElement.innerHTML = 'No image';
                                }}
                            />
                        </div>
                        
                        {/* Pet Details */}
                        <div className="flex-grow">
                            <h3 className="text-xl font-semibold text-indigo-700">Donating for {pet.name}</h3>
                            <p className="text-sm text-gray-500 mb-1">{pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old</p>
                            <p className="text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">{pet.description || 'A worthy friend looking for support.'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Donation Form */}
            <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow-2xl max-w-lg mx-auto donate-form">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    {pet ? `Support ${pet.name}'s Care` : 'Choose Donation Amount'}
                </h3>
                
                {/* Preset Amounts */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6 preset">
                    {[50, 100, 200, 500, 1000, 2000, 5000].map(v => (
                        <button 
                            type="button" 
                            key={v} 
                            onClick={() => setAmount(v)} 
                            className={`p-3 rounded-lg border font-medium transition duration-200 
                                ${amount === v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-indigo-600 border-indigo-300 hover:bg-indigo-100'}`}
                        >
                            ₱ {v.toLocaleString()}
                        </button>
                    ))}
                </div>
                
                {/* Custom Amount Input */}
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter custom amount (₱):
                </label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    min="1"
                    placeholder="Enter amount"
                    required
                    className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
                
                {/* Submit Button */}
                <button 
                    type="submit" 
                    className="btn primary w-full text-lg py-3" 
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (pet ? `Donate ₱${amount.toLocaleString()} for ${pet.name}` : `Donate ₱${amount.toLocaleString()}`)}
                </button>
            </form>

            {/* Status Message */}
            {status && (
                <div className={`p-4 rounded-lg font-medium text-center mt-6 max-w-lg mx-auto 
                    ${status.includes('Thank you') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status}
                </div>
            )}

            {/* General Donation CTA (if not targeting a pet) */}
            {!pet && (
                <div className="mt-12 text-center p-8 bg-indigo-50 rounded-xl border border-indigo-200">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-3">Targeted Donation Impact</h3>
                    <p className="text-indigo-600 mb-6">
                        Want to see your donation go to a specific furry friend?
                    </p>
                    <a href="/adopt" className="btn accent text-lg">
                        Browse Available Pets
                    </a>
                </div>
            )}
        </div>
    );
}