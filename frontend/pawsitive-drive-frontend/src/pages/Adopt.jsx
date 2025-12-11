import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import "./Adopt.css";

const API_ROOT = process.env.REACT_APP_API_BASE ?? 'http://localhost:8080/api';

export default function Adopt() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      // Load all pets, then filter to show only Available ones
      const res = await axios.get(`${API_ROOT}/pets`);
      // Ensure we always set an array
      let allPets = Array.isArray(res.data) ? res.data : [];
      
      console.log('All pets from API:', allPets);
      console.log('Pet statuses:', allPets.map(p => ({ name: p.name, status: p.status })));
      
      // Filter to show only Available pets (exclude Adopted and Pending)
      let petsData = allPets.filter(pet => 
        pet.status && 
        pet.status.toLowerCase() === 'available'
      );
      
      console.log('Filtered available pets:', petsData);
      console.log('Pets filtered out:', allPets.filter(pet => 
        !pet.status || pet.status.toLowerCase() !== 'available'
      ).map(p => ({ name: p.name, status: p.status })));
      
      setPets(petsData);
    } catch (err) {
      console.error('Failed to load pets:', err);
      console.error('Error details:', err.response?.data || err.message);
      setPets([]); // Always set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = async (pet) => {
    // Show confirmation modal if selectedPet is null
    if (!selectedPet) {
      setSelectedPet(pet);
      return;
    }

    if (!user) {
      setMessage('Please log in to adopt a pet.');
      setTimeout(() => setMessage(''), 3000);
      setSelectedPet(null);
      return;
    }

    try {
      // Get user ID
      const userId = user.user_id || user.id;
      if (!userId) {
        throw new Error("User ID is missing. Please log in again.");
      }
      
      // Get full user object - with error handling
      let fullUser;
      try {
        const userRes = await axios.get(`${API_ROOT}/users/${userId}`);
        fullUser = userRes.data;
      } catch (userErr) {
        console.error('Failed to fetch user:', userErr);
        // If user fetch fails, try to use the user object we already have
        if (user && (user.user_id || user.id)) {
          fullUser = user;
        } else {
          throw new Error("Unable to retrieve user information. Please try logging in again.");
        }
      }

      // Get full pet object - with error handling
      let fullPet;
      try {
        const petRes = await axios.get(`${API_ROOT}/pets/${pet.pet_id}`);
        fullPet = petRes.data;
      } catch (petErr) {
        console.error('Failed to fetch pet:', petErr);
        // Use the pet object we already have
        fullPet = pet;
      }

      const application = {
        pet: fullPet,
        user: fullUser,
        status: 'Pending'
      };

      console.log('Submitting adoption application:', { petId: pet.pet_id, userId: userId, status: 'Pending' });
      
      const response = await axios.post(`${API_ROOT}/applications`, application);
      
      console.log('Application submitted successfully:', response.data);
      
      if (response.status === 201 || response.status === 200) {
        setMessage(`✅ Adoption application submitted for ${pet.name}! The admin will review your application.`);
        setSelectedPet(null);
        loadPets(); // Reload to update status if needed
        setTimeout(() => setMessage(''), 5000);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      console.error('Failed to submit adoption application:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit adoption application. Please try again.';
      setMessage(`Error: ${errorMessage}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      // Ensure modal closes after action
      setSelectedPet(null);
    }
  };

  const handleDonate = (pet) => {
    // Navigate to donate page with pet ID
    // Use Link or useNavigate if this were a single-file React component, 
    // but window.location.href works for navigation to other routes.
    window.location.href = `/donate?petId=${pet.pet_id}&petName=${encodeURIComponent(pet.name || '')}`;
  };

  if (loading) return <div className="loading">Loading pets…</div>;

  // Ensure pets is always an array before rendering
  const petsArray = Array.isArray(pets) ? pets : [];

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="section-title">Dogs and Cats Available for Adoption</h2>
        <p className="section-subtitle">Find your perfect companion and give them a loving home</p>
      </div>

      {message && <div className="flash">{message}</div>}

      {petsArray.length === 0 ? (
        <div className="empty-state">
          <h3>No pets available at the moment</h3>
          <p>Check back soon for new pets looking for their forever homes!</p>
        </div>
      ) : (
        <div className="grid cards">
          {petsArray.map(p => (
            <article key={p.pet_id} className="adopt-card">
              <div className="adopt-card-image-wrapper">
                {p.image_url ? (
                  <img 
                    src={p.image_url} 
                    alt={p.name}
                    className="adopt-card-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="adopt-card-image-placeholder">No Image Available</div>';
                    }}
                  />
                ) : (
                  <div className="adopt-card-image-placeholder">No Image Available</div>
                )}
                <div className="adopt-card-status-badge">
                  <span className={`status-badge ${String(p.status || 'Available').toLowerCase()}`}>
                    {p.status || 'Available'}
                  </span>
                </div>
              </div>
              <div className="adopt-card-body">
                <div className="adopt-card-header">
                  <h3 className="adopt-card-name">{p.name}</h3>
                </div>
                <div className="adopt-card-attributes">
                  <span className="attribute-item">
                    <strong>{p.breed}</strong>
                  </span>
                  <span className="attribute-separator">•</span>
                  <span className="attribute-item">
                    {p.age} {p.age === 1 ? 'year' : 'years'} old
                  </span>
                  <span className="attribute-separator">•</span>
                  <span className="attribute-item">{p.gender}</span>
                </div>
                <p className="adopt-card-description">
                  {p.description || 'A wonderful companion looking for a loving home.'}
                </p>
                <div className="adopt-card-actions">
                  <button 
                    className="adopt-btn" 
                    onClick={() => setSelectedPet(p)}
                  >
                    <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="2.5" fill="currentColor"/>
                      <circle cx="15" cy="9" r="2.5" fill="currentColor"/>
                      <circle cx="9" cy="15" r="2.5" fill="currentColor"/>
                      <circle cx="15" cy="15" r="2.5" fill="currentColor"/>
                      <ellipse cx="12" cy="19" rx="3" ry="2.5" fill="currentColor"/>
                    </svg>
                    <span>Adopt</span>
                  </button>
                  <button 
                    className="donate-btn" 
                    onClick={() => handleDonate(p)}
                  >
                    <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Donate</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedPet && (
        <div className="modal-overlay" onClick={() => setSelectedPet(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adopt {selectedPet.name}</h2>
              <button className="modal-close" onClick={() => setSelectedPet(null)}>×</button>
            </div>
            <div>
              <p>Are you sure you want to submit an adoption application for {selectedPet.name}?</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                    className="btn accent" 
                    // Pass selectedPet to handleAdopt for processing
                    onClick={() => handleAdopt(selectedPet)}
                >
                  Yes, Submit Application
                </button>
                <button className="btn outline" onClick={() => setSelectedPet(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}