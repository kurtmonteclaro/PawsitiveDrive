import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
    const [featuredPets, setFeaturedPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load a few featured pets (first 3 available)
        axios.get('/api/pets?status=Available')
            .then(res => {
                setFeaturedPets(res.data.slice(0, 3));
            })
            .catch(err => {
                console.error('Failed to load featured pets:', err);
                setError('Could not load featured pets.');
                setFeaturedPets([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="home-container">
            {/* --- Hero Section --- */}
            <section className="hero bg-indigo-600 text-white py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center hero-content">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
                        Give Every Pet a Chance at <span className="text-yellow-300 accent">Love</span>. Adopt Today.
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-95">
                        Browse our furry friends ready for adoption and see how you can help make a difference in their lives.
                    </p>
                    <div className="flex justify-center space-x-4 hero-actions">
                        <Link to="/adopt" className="btn bg-white text-indigo-600 hover:bg-gray-100 text-lg font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 primary">
                            🐾 Explore Pets
                        </Link>
                        <Link 
                            to="/donate" 
                            className="btn text-white text-lg font-bold py-3 px-8 rounded-full border-2 border-white hover:bg-white hover:text-indigo-600 transition duration-300"
                        >
                            💝 Donate
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- Featured Pets Section --- */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading featured pets...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-600">{error}</div>
                ) : featuredPets.length > 0 && (
                    <section className="py-16">
                        <div className="page-header text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">Featured Pets</h2>
                            <p className="text-lg text-gray-500">Meet some of our wonderful pets looking for their forever homes</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredPets.map(pet => (
                                <article key={pet.pet_id} className="bg-white rounded-xl shadow-lg overflow-hidden card transition-all hover:shadow-xl">
                                    <div className="h-64 overflow-hidden pet-thumb">
                                        {pet.image_url ? (
                                            <img 
                                                src={pet.image_url} 
                                                alt={pet.name}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">No Image Available</div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                                                No Image Available
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 card-body">
                                        <div className="flex justify-between items-start mb-2 card-title">
                                            <h4 className="text-xl font-semibold text-gray-900">{pet.name}</h4>
                                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 badge available">
                                                Available
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3 muted">
                                            {pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                                        </p>
                                        <p className="text-gray-700 leading-relaxed text-sm mb-4">
                                            {pet.description ? (pet.description.length > 100 ? pet.description.substring(0, 100) + '...' : pet.description) : 'A wonderful companion looking for a loving home.'}
                                        </p>
                                        <div className="card-actions">
                                            <Link to="/adopt" className="btn bg-indigo-500 text-white hover:bg-indigo-600 w-full py-2 text-center rounded-lg text-sm transition duration-300 accent small">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link to="/adopt" className="btn bg-indigo-600 text-white hover:bg-indigo-700 py-3 px-6 rounded-full primary">View All Available Pets</Link>
                        </div>
                    </section>
                )}

                {/* --- How You Can Help Section --- */}
                <section className="my-16 bg-white p-8 sm:p-12 rounded-xl shadow-2xl border border-gray-100">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-10">How You Can Help Our Mission</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            <div className="p-4">
                                <div className="text-5xl mb-4 text-indigo-500">🐾</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Adopt</h3>
                                <p className="text-gray-600">Give a pet a loving forever home and change two lives—theirs and yours.</p>
                            </div>
                            
                            <div className="p-4">
                                <div className="text-5xl mb-4 text-pink-500">💝</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Donate</h3>
                                <p className="text-gray-600">Your financial support helps cover medical care, food, and shelter.</p>
                            </div>
                            
                            <div className="p-4">
                                <div className="text-5xl mb-4 text-green-500">📣</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Share</h3>
                                <p className="text-gray-600">Spread the word about our pets and events on social media.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
