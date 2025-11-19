import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useUserRole } from '../context/UserRoleContext'; // Ensure path is correct
import { useAuth } from '../context/AuthContext'; 

export default function AdminDashboard() {
    const { role } = useUserRole();
    const { user } = useAuth();
    
    // Check if user is admin based on their actual role
    // Using role from UserRoleContext (if available) or checking the user object directly
    const isAdmin = role === 'Admin' || (user && user.role?.role_name === 'Admin');

    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false); // Loading state for form submission

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
            const res = await axios.get('/api/pets');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setMessage('Please log in to create pets.');
            return;
        }
        setFormLoading(true);

        try {
            // Fetch full user object to ensure entity mapping works on backend for 'addedBy'
            const userRes = await axios.get(`/api/users/${user.user_id || user.id}`);
            const fullUser = userRes.data;

            const petData = {
                ...formData,
                age: parseInt(formData.age),
                addedBy: fullUser
            };

            await axios.post('/api/pets', petData);
            
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
            const res = await axios.put(`/api/pets/${pet.pet_id}`, { ...pet, status });
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
            await axios.delete(`/api/pets/${petId}`);
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

                            <FormGroup label="Image URL *" name="image_url" value={formData.image_url} onChange={handleInputChange} type="url" placeholder="https://example.com/pet-image.jpg" required />
                            {formData.image_url && (
                                <div className="image-preview w-40 h-40 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img 
                                        src={formData.image_url} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-500 bg-gray-100">Invalid URL</div>';
                                        }} 
                                    />
                                </div>
                            )}

                            <FormGroup label="Description *" name="description" value={formData.description} onChange={handleInputChange} type="textarea" placeholder="Tell us about this pet's personality, needs, and story..." rows="4" required />

                            <button type="submit" className="btn bg-indigo-600 text-white hover:bg-indigo-700 w-full py-2.5 text-lg font-semibold" disabled={formLoading}>
                                {formLoading ? 'Creating Post...' : 'Create Pet Post'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Pets Table */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg table-wrap">
                <table className="min-w-full divide-y divide-gray-200 table">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species/Breed</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPets.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    No pets found in the "{filter}" category.
                                </td>
                            </tr>
                        ) : (
                            filteredPets.map(p => (
                                <tr key={p.pet_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {p.image_url ? (
                                            <img 
                                                src={p.image_url} 
                                                alt={p.name}
                                                className="w-12 h-12 object-cover rounded-md"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Image</div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Image</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{p.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{p.species} / {p.breed}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{p.age} yrs / {p.gender}</td>
                                    <td className="px-6 py-4 max-w-xs text-sm text-gray-700 overflow-hidden text-ellipsis desc" title={p.description}>
                                        {p.description.substring(0, 50)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select 
                                            value={p.status || ''} 
                                            onChange={(e) => updateStatus(p, e.target.value)}
                                            className={`p-2 border rounded-lg text-sm font-medium ${
                                                p.status === 'Available' ? 'bg-green-100 text-green-700 border-green-300' :
                                                p.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                                p.status === 'Adopted' ? 'bg-indigo-100 text-indigo-700 border-indigo-300' :
                                                'bg-gray-100 text-gray-700 border-gray-300'
                                            }`}
                                        >
                                            <option value="">—</option>
                                            <option>Available</option>
                                            <option>Pending</option>
                                            <option>Adopted</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-red-600 hover:text-red-900 transition duration-150 danger small" onClick={() => removePet(p.pet_id)}>
                                            Delete
                                        </button>
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
