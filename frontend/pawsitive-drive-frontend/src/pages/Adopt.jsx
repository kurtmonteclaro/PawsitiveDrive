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
      const res = await axios.get(`${API_ROOT}/pets?status=Available`);
      setPets(res.data);
    } catch (err) {
      console.error('Failed to load pets:', err);
      setPets([]);
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
      // Get full user object
      // Note: Assuming user.user_id or user.id is the identifier for the backend
      const userId = user.user_id || user.id;
      if (!userId) {
        throw new Error("User ID is missing.");
      }
      
      const userRes = await axios.get(`${API_ROOT}/users/${userId}`);
      const fullUser = userRes.data;

      // Get full pet object
      const petRes = await axios.get(`${API_ROOT}/pets/${pet.pet_id}`);
      const fullPet = petRes.data;

      const application = {
        pet: fullPet,
        user: fullUser,
        status: 'Pending'
      };

      await axios.post(`${API_ROOT}/applications`, application);
      setMessage(`Adoption application submitted for ${pet.name}!`);
      setSelectedPet(null);
      loadPets(); // Reload to update status if needed
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to submit adoption application:', err);
      setMessage('Failed to submit adoption application. Please try again.');
      setTimeout(() => setMessage(''), 3000);
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

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="section-title">Dogs and Cats Available for Adoption</h2>
        <p className="section-subtitle">Find your perfect companion and give them a loving home</p>
      </div>

      {message && <div className="flash">{message}</div>}

      {pets.length === 0 ? (
        <div className="empty-state">
          <h3>No pets available at the moment</h3>
          <p>Check back soon for new pets looking for their forever homes!</p>
        </div>
      ) : (
        <div className="grid cards">
          {pets.map(p => (
            <article key={p.pet_id} className="card">
              <div className="pet-thumb">
                {p.image_url ? (
                  <img 
                    src={p.image_url} 
                    alt={p.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f7f7f7,#ececec);color:#6c757d;font-size:14px;">No Image Available</div>';
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f7f7f7, #ececec)', color: '#6c757d', fontSize: '14px' }}>
                    No Image Available
                  </div>
                )}
              </div>
              <div className="card-body">
                <div className="card-title">
                  <h4>{p.name}</h4>
                  <span className={`badge ${String(p.status || 'Available').toLowerCase()}`}>
                    {p.status || 'Available'}
                  </span>
                </div>
                <p className="muted" style={{ marginBottom: '12px' }}>
                  <strong>{p.breed}</strong> • {p.age} {p.age === 1 ? 'year' : 'years'} old • {p.gender}
                </p>
                <p style={{ marginBottom: '16px', color: '#495057', lineHeight: '1.6', flex: 1 }}>
                  {p.description || 'A wonderful companion looking for a loving home.'}
                </p>
                <div className="card-actions">
                  <button 
                    className="btn accent small" 
                    // This now triggers the modal/confirmation first
                    onClick={() => setSelectedPet(p)}
                    style={{ flex: 1 }}
                  >
                    🐾 Adopt
                  </button>
                  <button 
                    className="btn primary small" 
                    onClick={() => handleDonate(p)}
                    style={{ flex: 1 }}
                  >
                    💝 Donate
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