import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load a few featured pets
    axios.get('/api/pets?status=Available')
      .then(res => {
        setFeaturedPets(res.data.slice(0, 3));
      })
      .catch(err => {
        console.error('Failed to load featured pets:', err);
        setFeaturedPets([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Give Every Pet a Chance at <span className="accent">Love</span>. Adopt Today.</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '24px', opacity: 0.95 }}>
            Browse our furry friends ready for adoption and see how you can help make a difference in their lives.
          </p>
          <div className="hero-actions">
            <Link to="/adopt" className="btn primary">🐾 Explore Pets</Link>
            <Link to="/donate" className="btn" style={{ background: 'rgba(255, 255, 255, 0.2)', border: '2px solid rgba(255, 255, 255, 0.5)', color: '#fff' }}>💝 Donate</Link>
          </div>
        </div>
      </section>

      {!loading && featuredPets.length > 0 && (
        <section style={{ marginTop: '64px' }}>
          <div className="page-header">
            <h2>Featured Pets</h2>
            <p>Meet some of our wonderful pets looking for their forever homes</p>
          </div>
          <div className="grid">
            {featuredPets.map(pet => (
              <article key={pet.pet_id} className="card">
                <div className="pet-thumb">
                  {pet.image_url ? (
                    <img 
                      src={pet.image_url} 
                      alt={pet.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f7f7f7,#ececec);color:#6c757d;font-size:14px;">No Image</div>';
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f7f7f7, #ececec)', color: '#6c757d', fontSize: '14px' }}>
                      No Image
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-title">
                    <h4>{pet.name}</h4>
                    <span className="badge available">Available</span>
                  </div>
                  <p className="muted" style={{ marginBottom: '12px' }}>
                    {pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                  </p>
                  <p style={{ marginBottom: '16px', color: '#495057', lineHeight: '1.6' }}>
                    {pet.description ? (pet.description.length > 100 ? pet.description.substring(0, 100) + '...' : pet.description) : 'A wonderful companion looking for a loving home.'}
                  </p>
                  <div className="card-actions">
                    <Link to="/adopt" className="btn accent small" style={{ flex: 1, textAlign: 'center' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/adopt" className="btn primary">View All Available Pets</Link>
          </div>
        </section>
      )}

      <section style={{ marginTop: '64px', background: '#fff', padding: '48px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0, color: '#2c3e50' }}>How You Can Help</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginTop: '32px' }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐾</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '8px' }}>Adopt</h3>
              <p style={{ color: '#6c757d' }}>Give a pet a loving forever home</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💝</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '8px' }}>Donate</h3>
              <p style={{ color: '#6c757d' }}>Support our mission with a donation</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❤️</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '8px' }}>Share</h3>
              <p style={{ color: '#6c757d' }}>Spread the word about our pets</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


