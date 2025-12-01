import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useUserRole } from '../context/UserRoleContext'; // Ensure path is correct
import { useAuth } from '../context/AuthContext';
import "./AdminDashboard.css";

const API_ROOT = process.env.REACT_APP_API_BASE ?? 'http://localhost:8080/api';

const ADMIN_ROLE_IDS = new Set([2]);

export default function AdminDashboard() {
    const { role } = useUserRole();
    const { user } = useAuth();
    
    const normalize = (value) => value ? String(value).trim().toLowerCase() : null;
    const resolvedRole = normalize(role) || normalize(user?.role?.role_name) || normalize(user?.role_name);
    const roleId = user?.role?.role_id ?? user?.role_id ?? user?.roleId;
    const isAdmin = resolvedRole === 'admin' || (roleId && ADMIN_ROLE_IDS.has(Number(roleId)));

    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false); // Loading state for form submission
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Initial state for new pet creation/editing
    const initialFormData = {
        name: '',
        species: 'Dog',
        breed: '',
        age: '',
        gender: 'Male',
        status: 'Available',
        description: '',
        image_url: ''
    };
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isAdmin) {
            loadPets();
        } else {
            setLoading(false); // Stop loading if access is denied immediately
        }
    }, [isAdmin]);

    // --- Data Fetching and Filtering ---
    const loadPets = async () => {
        try {
            const res = await axios.get(`${API_ROOT}/pets`);
            setPets(res.data);
        } catch (err) {
            console.error('Failed to load pets:', err);
            setMessage('Error loading pet data.');
            setPets([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPets = useMemo(() => {
        if (filter === 'All') return pets;
        return pets.filter(p => (p.status || '').toLowerCase() === filter.toLowerCase());
    }, [pets, filter]);

    // --- Access Control ---
    if (!isAdmin) {
        return (
            <div className="empty-state text-center p-12 my-10 bg-red-50 rounded-lg shadow-md max-w-lg mx-auto">
                <h3 className="text-2xl font-bold text-red-600 mb-3">🚫 Access Denied</h3>
                <p className="text-gray-600">You must be an Admin to view this page. Please log in with an Admin account.</p>
            </div>
        );
    }

    if (loading) return <div className="text-center py-16 text-xl text-gray-500">Loading admin data…</div>;

    // --- Handlers ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('file', file);
        setUploadingImage(true);
        setUploadError('');

        try {
            const res = await axios.post(`${API_ROOT}/pets/upload-image`, data);
            setFormData(prev => ({ ...prev, image_url: res.data.url }));
        } catch (err) {
            console.error('Failed to upload image:', err);
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setMessage('Please log in to create pets.');
            return;
        }
        if (!formData.image_url) {
            setMessage('Please upload a pet photo before publishing.');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        setFormLoading(true);

        try {
            const petData = {
                ...formData,
                age: parseInt(formData.age, 10),
                addedBy: user.user_id || user.id
            };

            await axios.post(`${API_ROOT}/pets`, petData);
            
            setMessage('Pet created successfully! 🎉');
            setShowForm(false);
            setFormData(initialFormData);
            loadPets();
            
        } catch (err) {
            console.error('Failed to create pet:', err);
            setMessage('Failed to create pet. Check form data and try again.');
        } finally {
            setFormLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const updateStatus = async (pet, status) => {
        try {
            const res = await axios.put(`${API_ROOT}/pets/${pet.pet_id}`, { ...pet, status });
            // Update local state with the returned pet object
            setPets(prev => prev.map(x => x.pet_id === pet.pet_id ? res.data : x));
            setMessage(`Status for ${pet.name} updated to ${status}.`);
            setTimeout(() => setMessage(''), 1500);
        } catch {
            setMessage('Failed to update status.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const removePet = async (petId) => {
        if (!window.confirm('Are you sure you want to permanently delete this pet? This action cannot be undone.')) return;
        try {
            await axios.delete(`${API_ROOT}/pets/${petId}`);
            setPets(prev => prev.filter(x => x.pet_id !== petId));
            setMessage('Pet deleted successfully.🗑️');
            setTimeout(() => setMessage(''), 3000);
        } catch {
            setMessage('Failed to delete pet.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // --- JSX Render ---
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="page-header mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
                <p className="text-gray-500">Manage pet posts and adoption statuses.</p>
            </div>

            {/* Message Bar */}
            {message && (
                <div className={`p-3 mb-6 rounded-lg font-medium ${message.includes('success') || message.includes('updated') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            {/* Admin Toolbar */}
            <div className="flex justify-between items-center mb-6 admin-toolbar">
                <div className="flex items-center space-x-3 filters">
                    <label className="font-semibold text-gray-700">Filter by Status:</label>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option>All</option>
                        <option>Available</option>
                        <option>Pending</option>
                        <option>Adopted</option>
                    </select>
                </div>
                <button className="btn bg-indigo-600 text-white hover:bg-indigo-700 py-2 px-4 rounded-lg accent" onClick={() => {
                    setFormData(initialFormData); // Clear form data on open
                    setShowForm(true);
                }}>
                    + Create New Pet Post
                </button>
            </div>

            {/* Modal for Pet Creation/Editing */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full modal-overlay z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xl modal" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 modal-header">
                            <h2 className="text-2xl font-bold text-gray-800">Create New Pet Post</h2>
                            <button className="text-gray-500 hover:text-gray-800 text-3xl modal-close" onClick={() => setShowForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="pet-form space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormGroup label="Pet Name *" name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="e.g., Max" required />
                                <FormGroup label="Species *" name="species" value={formData.species} onChange={handleInputChange} type="select" options={['Dog', 'Cat']} required />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <FormGroup label="Breed *" name="breed" value={formData.breed} onChange={handleInputChange} type="text" placeholder="e.g., Golden Retriever" required />
                                <FormGroup label="Age (years) *" name="age" value={formData.age} onChange={handleInputChange} type="number" min="0" max="30" placeholder="e.g., 2" required />
                                <FormGroup label="Gender *" name="gender" value={formData.gender} onChange={handleInputChange} type="select" options={['Male', 'Female']} required />
                            </div>

                            <FormGroup label="Status *" name="status" value={formData.status} onChange={handleInputChange} type="select" options={['Available', 'Pending', 'Adopted']} required />

                            <div className="form-group space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Pet Photo *</label>
                                {formData.image_url ? (
                                    <div className="image-preview w-40 h-40 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-500 bg-gray-100">Invalid image</div>';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Upload a photo of the pet (required).</p>
                                )}
                                <div className="space-y-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        required={!formData.image_url}
                                    />
                                    {uploadingImage && <p className="text-sm text-gray-600">Uploading image…</p>}
                                    {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                                    {formData.image_url && (
                                        <button
                                            type="button"
                                            className="text-xs text-red-600 underline"
                                            onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                        >
                                            Remove image
                                        </button>
                                    )}
                                </div>
                            </div>

                            <FormGroup label="Description *" name="description" value={formData.description} onChange={handleInputChange} type="textarea" placeholder="Tell us about this pet's personality, needs, and story..." rows="4" required />

                            <button type="submit" className="btn bg-indigo-600 text-white hover:bg-indigo-700 w-full py-2.5 text-lg font-semibold" disabled={formLoading}>
                                {formLoading ? 'Creating Post...' : 'Create Pet Post'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Pets Table */}
            <div className="admin-pets-table">
                <div className="admin-pets-header">
                    <span>Image</span>
                    <span>Pet</span>
                    <span>Type</span>
                    <span>Age / Gender</span>
                    <span>Description</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>
                <div className="admin-pets-body">
                    {filteredPets.length === 0 ? (
                        <div className="admin-pets-empty">
                            No pets found in the "{filter}" category.
                        </div>
                    ) : (
                        filteredPets.map((p) => (
                            <div key={p.pet_id} className="admin-pets-row">
                                <div className="pet-thumb">
                                    {p.image_url ? (
                                        <img
                                            src={p.image_url}
                                            alt={p.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="no-img">No Image</div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="no-img">No Image</div>
                                    )}
                                </div>
                                <div className="pet-name">
                                    <p>{p.name}</p>
                                    <small>{p.created_at ? new Date(p.created_at).toLocaleDateString() : 'New entry'}</small>
                                </div>
                                <div className="pet-type">
                                    <span>{p.species}</span>
                                    <small>{p.breed}</small>
                                </div>
                                <div className="pet-age">
                                    {p.age} yrs • {p.gender}
                                </div>
                                <div className="pet-description">
                                    {p.description ? `${p.description.slice(0, 70)}${p.description.length > 70 ? '…' : ''}` : 'No description'}
                                </div>
                                <div className={`pet-status status-${String(p.status || '').toLowerCase()}`}>
                                    <select value={p.status || ''} onChange={(e) => updateStatus(p, e.target.value)}>
                                        <option value="">—</option>
                                        <option>Available</option>
                                        <option>Pending</option>
                                        <option>Adopted</option>
                                    </select>
                                </div>
                                <div className="pet-actions">
                                    <button onClick={() => removePet(p.pet_id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper component for form groups
const FormGroup = ({ label, name, value, onChange, type = 'text', options, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        {type === 'select' ? (
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                {...props}
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        ) : type === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                {...props}
            />
        ) : (
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                {...props}
            />
        )}
    </div>
);
