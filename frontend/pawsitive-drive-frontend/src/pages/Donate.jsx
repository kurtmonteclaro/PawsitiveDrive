import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function Donate() {
  const [amount, setAmount] = useState(500);
  const [status, setStatus] = useState('');
  const [pet, setPet] = useState(null);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const petId = params.get('petId');
    const petName = params.get('petName');
    
    if (petId) {
      // Load pet details
      axios.get(`/api/pets/${petId}`)
        .then(res => setPet(res.data))
        .catch(err => console.error('Failed to load pet:', err));
    }
  }, [location.search]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('Processing…');

    try {
      let donationData = {
        amount,
        payment_method: 'Manual',
        status: 'Completed'
      };

      // If donating to a specific pet, include user reference
      if (pet && user) {
        // Fetch full user details to include in donation data if needed by backend
        const userRes = await axios.get(`/api/users/${user.user_id || user.id}`);
        donationData.user = userRes.data;
        // The pet reference is usually sent separately or determined by the context on the backend, 
        // but for completeness, we could add pet_id to donationData if the backend expects it.
        // Since the original code didn't explicitly include pet reference in donationData before
        // the post, we'll keep the minimal change.
      }
      
      const res = await axios.post('/api/donations', donationData);
      
      if (res.status === 201) {
        setStatus(`Thank you for your donation of ₱${amount}! ${pet ? `Your contribution will help ${pet.name} find a loving home.` : ''}`);
        setAmount(500);
        if (pet) {
          setTimeout(() => {
            window.location.href = '/adopt';
          }, 3000);
        }
      } else {
        setStatus('Something went wrong.');
      }
    } catch (err) {
      console.error('Donation error:', err);
      setStatus('Failed to process donation. Please try again.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Make a Donation</h2>
        <p>Your contribution helps us care for pets and find them loving homes</p>
      </div>

      {pet && (
        <div className="card" style={{ marginBottom: '32px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
            {pet.image_url && (
              <img 
                src={pet.image_url} 
                alt={pet.name}
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Donating for {pet.name}</h3>
              <p style={{ margin: '0 0 4px 0', color: '#6c757d' }}>{pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old</p>
              <p style={{ margin: 0, color: '#495057', fontSize: '0.9375rem' }}>{pet.description}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="donate-form">
        <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#2c3e50' }}>
          {pet ? `Donate to help ${pet.name}` : 'Choose Donation Amount'}
        </h3>
        
        <div className="preset">
          {[50, 100, 200, 250, 350, 500, 1000, 2000, 5000].map(v => (
            <button 
              type="button" 
              key={v} 
              onClick={() => setAmount(v)} 
              className={amount === v ? 'active' : ''}
            >
              ₱ {v.toLocaleString()}
            </button>
          ))}
        </div>
        
        <label htmlFor="amount" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
          Or enter custom amount:
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          min="1"
          placeholder="Enter amount"
          required
        />
        
        <button type="submit" className="btn accent" style={{ width: '100%', marginTop: '8px' }}>
          {pet ? `Donate ₱${amount.toLocaleString()} for ${pet.name}` : `Donate ₱${amount.toLocaleString()}`}
        </button>
      </form>

      {status && (
        <div className="flash" style={{ marginTop: '24px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          {status}
        </div>
      )}

      {!pet && (
        <div style={{ marginTop: '48px', textAlign: 'center', padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Want to donate to a specific pet?</h3>
          <p style={{ color: '#6c757d', marginBottom: '24px' }}>
            Browse our available pets and click the "Donate" button on any pet's card to make a targeted donation.
          </p>
          <a href="/adopt" className="btn primary">
            Browse Available Pets
          </a>
        </div>
      )}
    </div>
  );
}