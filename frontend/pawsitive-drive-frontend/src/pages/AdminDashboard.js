import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useUserRole } from '../context/UserRoleContext';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { role } = useUserRole();
  const { user } = useAuth();
  
  // Check if user is admin based on their actual role
  const isAdmin = role === 'Admin' || (user && user.role && user.role.role_name === 'Admin');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    status: 'Available',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const res = await axios.get('/api/pets');
      setPets(res.data);
    } catch (err) {
      console.error('Failed to load pets:', err);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = useMemo(() => {
    if (filter === 'All') return pets;
    return pets.filter(p => (p.status || '').toLowerCase() === filter.toLowerCase());
  }, [pets, filter]);

  if (!isAdmin) {
    return (
      <div className="empty-state">
        <h3>Access Denied</h3>
        <p>You must be an Admin to view this page. Please log in with an Admin account.</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage('Please log in to create pets.');
      return;
    }

    try {
      // Get user details to set addedBy
      const userRes = await axios.get(`/api/users/${user.user_id || user.id}`);
      const fullUser = userRes.data;

      const petData = {
        ...formData,
        age: parseInt(formData.age),
        addedBy: fullUser
      };

      await axios.post('/api/pets', petData);
      setMessage('Pet created successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        species: 'Dog',
        breed: '',
        age: '',
        gender: 'Male',
        status: 'Available',
        description: '',
        image_url: ''
      });
      loadPets();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to create pet:', err);
      setMessage('Failed to create pet. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateStatus = async (pet, status) => {
    try {
      const res = await axios.put(`/api/pets/${pet.pet_id}`, { ...pet, status });
      setPets(prev => prev.map(x => x.pet_id === pet.pet_id ? res.data : x));
      setMessage('Status updated.');
      setTimeout(() => setMessage(''), 1500);
    } catch {
      setMessage('Failed to update status.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removePet = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return;
    try {
      await axios.delete(`/api/pets/${petId}`);
      setPets(prev => prev.filter(x => x.pet_id !== petId));
      setMessage('Pet deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to delete pet.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="loading">Loading admin data…</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Manage pets and adoption applications</p>
      </div>

      {message && <div className="flash">{message}</div>}

      <div className="admin-toolbar">
        <div className="filters" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: 600 }}>Filter by Status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '2px solid #e9ecef', borderRadius: '8px' }}
          >
            <option>All</option>
            <option>Available</option>
            <option>Adopted</option>
            <option>Pending</option>
          </select>
        </div>
        <button className="btn accent" onClick={() => setShowForm(true)}>
          + Create New Pet Post
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Pet Post</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="pet-form">
              <div>
                <label htmlFor="name">Pet Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Max"
                />
              </div>

              <div>
                <label htmlFor="species">Species *</label>
                <select
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
              </div>

              <div>
                <label htmlFor="breed">Breed *</label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label htmlFor="age">Age (years) *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="30"
                    placeholder="e.g., 2"
                  />
                </div>

                <div>
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="Adopted">Adopted</option>
                </select>
              </div>

              <div>
                <label htmlFor="image_url">Image URL *</label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/pet-image.jpg"
                />
                {formData.image_url && (
                  <div className="image-preview" style={{ marginTop: '12px' }}>
                    <img src={formData.image_url} alt="Preview" onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="image-preview-placeholder">Invalid image URL</div>';
                    }} />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Tell us about this pet's personality, needs, and story..."
                  rows="4"
                />
              </div>

              <button type="submit" className="btn accent">Create Pet Post</button>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Species</th>
              <th>Breed</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPets.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: '#6c757d' }}>
                  No pets found. Create your first pet post!
                </td>
              </tr>
            ) : (
              filteredPets.map(p => (
                <tr key={p.pet_id}>
                  <td>
                    {p.image_url ? (
                      <img 
                        src={p.image_url} 
                        alt={p.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div style="width:60px;height:60px;background:#e9ecef;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#6c757d;">No Image</div>';
                        }}
                      />
                    ) : (
                      <div style={{ width: '60px', height: '60px', background: '#e9ecef', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#6c757d' }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.species}</td>
                  <td>{p.breed}</td>
                  <td>{p.age} yrs</td>
                  <td>{p.gender}</td>
                  <td>
                    <select 
                      value={p.status || ''} 
                      onChange={(e) => updateStatus(p, e.target.value)}
                      style={{ padding: '6px 12px', border: '2px solid #e9ecef', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}
                    >
                      <option value="">—</option>
                      <option>Available</option>
                      <option>Pending</option>
                      <option>Adopted</option>
                    </select>
                  </td>
                  <td className="desc" title={p.description}>{p.description}</td>
                  <td>
                    <button className="btn danger small" onClick={() => removePet(p.pet_id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
