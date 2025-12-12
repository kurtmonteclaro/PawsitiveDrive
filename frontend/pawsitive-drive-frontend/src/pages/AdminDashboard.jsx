import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
    const [applications, setApplications] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applicationsLoading, setApplicationsLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [filter, setFilter] = useState('All');
    const [appFilter, setAppFilter] = useState('Pending'); // Filter for applications
    const [activeTab, setActiveTab] = useState('pets'); // 'pets', 'applications', or 'history'
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
    // Use a ref to always have the latest formData value to avoid closure issues
    const formDataRef = useRef(formData);
    
    // Keep ref in sync with state - this ensures we always have the latest value
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    // --- Data Fetching and Filtering ---
    const loadPets = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching pets from:', `${API_ROOT}/pets`);
            const res = await axios.get(`${API_ROOT}/pets`);
            console.log('Pets API response:', res.data);
            console.log('Response type:', typeof res.data);
            console.log('Response status:', res.status);
            console.log('Response headers:', res.headers);
            console.log('Is array?', Array.isArray(res.data));
            
            // Handle different response formats
            let petsData = [];
            
            // Helper function to extract pet data and break circular references
            const extractPetData = (pet) => {
                if (!pet || typeof pet !== 'object') return null;
                return {
                    pet_id: pet.pet_id,
                    name: pet.name,
                    species: pet.species,
                    breed: pet.breed,
                    age: pet.age,
                    gender: pet.gender,
                    status: pet.status,
                    description: pet.description,
                    image_url: pet.image_url,
                    created_at: pet.created_at,
                    // Only include addedBy basic info, not full nested objects
                    addedBy: pet.addedBy ? {
                        user_id: pet.addedBy.user_id,
                        name: pet.addedBy.name,
                        email: pet.addedBy.email
                    } : null
                    // Don't include applications to avoid circular reference
                };
            };
            
            // If response is a string, try to parse it as JSON
            if (typeof res.data === 'string') {
                console.warn('Response is a string, attempting to parse as JSON...');
                try {
                    // Try to parse, but limit the depth to avoid circular reference issues
                    const parsed = JSON.parse(res.data);
                    console.log('Parsed JSON successfully');
                    
                    if (Array.isArray(parsed)) {
                        // Extract clean pet data from each pet, breaking circular references
                        petsData = parsed.map(extractPetData).filter(pet => pet !== null);
                    } else if (parsed && typeof parsed === 'object') {
                        // Handle parsed object
                        if (parsed.data && Array.isArray(parsed.data)) {
                            petsData = parsed.data.map(extractPetData).filter(pet => pet !== null);
                        } else if (parsed.pets && Array.isArray(parsed.pets)) {
                            petsData = parsed.pets.map(extractPetData).filter(pet => pet !== null);
                        } else {
                            const extracted = extractPetData(parsed);
                            petsData = extracted ? [extracted] : [];
                        }
                    }
                } catch (parseError) {
                    console.error('Failed to parse string response as JSON:', parseError);
                    // Try to extract valid JSON from the beginning of the string
                    try {
                        // Find the first complete array in the string
                        const arrayStart = res.data.indexOf('[');
                        if (arrayStart !== -1) {
                            // Try to find a reasonable end point (first pet object should be complete)
                            const firstPetEnd = res.data.indexOf('}', arrayStart);
                            if (firstPetEnd !== -1) {
                                // Try to parse just the first pet
                                const firstPetStr = res.data.substring(arrayStart, firstPetEnd + 1) + ']';
                                const partialParsed = JSON.parse(firstPetStr);
                                if (Array.isArray(partialParsed) && partialParsed.length > 0) {
                                    petsData = [extractPetData(partialParsed[0])].filter(pet => pet !== null);
                                    console.warn('Extracted partial data due to circular reference');
                                }
                            }
                        }
                    } catch (fallbackError) {
                        console.error('Fallback parsing also failed:', fallbackError);
                        petsData = [];
                    }
                }
            } else if (Array.isArray(res.data)) {
                // Extract clean pet data, breaking circular references
                petsData = res.data.map(extractPetData).filter(pet => pet !== null);
            } else if (res.data && typeof res.data === 'object') {
                // If it's an object, try to extract array from common properties
                if (res.data.data && Array.isArray(res.data.data)) {
                    petsData = res.data.data.map(extractPetData).filter(pet => pet !== null);
                } else if (res.data.pets && Array.isArray(res.data.pets)) {
                    petsData = res.data.pets.map(extractPetData).filter(pet => pet !== null);
                } else {
                    // If it's a single pet object, extract clean data
                    const extracted = extractPetData(res.data);
                    petsData = extracted ? [extracted] : [];
                }
            }
            
            console.log('Processed pets data:', petsData);
            console.log('Number of pets loaded:', petsData.length);
            if (petsData.length > 0) {
                console.log('First pet:', petsData[0]);
            }
            setPets(petsData);
        } catch (err) {
            console.error('Failed to load pets:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            console.error('Error message:', err.message);
            
            // Show more specific error messages
            if (err.response?.status === 403) {
                setMessage('Access denied. Please check backend security configuration.');
            } else if (err.response?.status === 401) {
                setMessage('Unauthorized. Please log in.');
            } else if (err.response?.data) {
                setMessage(`Error loading pet data: ${err.response.data.message || err.response.data}`);
            } else {
                setMessage(`Error loading pet data: ${err.message}`);
            }
            setPets([]); // Always set to empty array on error
        } finally {
            setLoading(false);
        }
    }, []);

    const loadApplications = useCallback(async () => {
        try {
            console.log('Loading adoption applications...');
            const res = await axios.get(`${API_ROOT}/applications`);
            console.log('Applications loaded:', res.data);
            // Ensure we always set an array
            const applicationsData = Array.isArray(res.data) ? res.data : [];
            setApplications(applicationsData);
            // Clear any previous error messages if successful
            if (message && message.includes('Error loading adoption applications')) {
                setMessage('');
            }
        } catch (err) {
            console.error('Failed to load applications:', err);
            console.error('Error details:', err.response?.data || err.message);
            // Only show error if we're on the applications tab
            if (activeTab === 'applications') {
                const errorMsg = err.response?.status === 403 
                    ? 'Access denied. Please check backend security configuration.'
                    : 'Error loading adoption applications. Please try refreshing the page.';
                setMessage(errorMsg);
            }
            setApplications([]); // Always set to empty array on error
        } finally {
            setApplicationsLoading(false);
        }
    }, [activeTab, message]);

    const loadHistory = useCallback(async () => {
        try {
            setHistoryLoading(true);
            const [donationsRes, adoptionsRes] = await Promise.all([
                axios.get(`${API_ROOT}/donations`),
                axios.get(`${API_ROOT}/applications`)
            ]);
            console.log('Donations response:', donationsRes.data);
            console.log('Donations count:', Array.isArray(donationsRes.data) ? donationsRes.data.length : 'Not an array');
            const donationsData = Array.isArray(donationsRes.data) ? donationsRes.data : [];
            setDonations(donationsData);
            const applicationsData = Array.isArray(adoptionsRes.data) ? adoptionsRes.data : [];
            setApplications(applicationsData);
        } catch (err) {
            console.error('Failed to load history:', err);
            console.error('Error response:', err.response?.data);
            setDonations([]);
            setApplications([]);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            loadPets();
            loadApplications();
        } else {
            setLoading(false); // Stop loading if access is denied immediately
            setApplicationsLoading(false);
        }
    }, [isAdmin, loadPets, loadApplications]);

    useEffect(() => {
        if (isAdmin && activeTab === 'history') {
            loadHistory();
        }
    }, [isAdmin, activeTab]); // Removed loadHistory from deps to avoid infinite loop

    const filteredPets = useMemo(() => {
        // Ensure pets is always an array
        const petsArray = Array.isArray(pets) ? pets : [];
        if (filter === 'All') return petsArray;
        return petsArray.filter(p => (p.status || '').toLowerCase() === filter.toLowerCase());
    }, [pets, filter]);

    const filteredApplications = useMemo(() => {
        // Ensure applications is always an array
        const applicationsArray = Array.isArray(applications) ? applications : [];
        if (appFilter === 'All') return applicationsArray;
        return applicationsArray.filter(app => (app.status || '').toLowerCase() === appFilter.toLowerCase());
    }, [applications, appFilter]);

    // --- Access Control ---
    if (!isAdmin) {
        return (
            <div className="empty-state text-center p-12 my-10 bg-red-50 rounded-lg shadow-md max-w-lg mx-auto">
                <h3 className="text-2xl font-bold text-red-600 mb-3">🚫 Access Denied</h3>
                <p className="text-gray-600">You must be an Admin to view this page. Please log in with an Admin account.</p>
            </div>
        );
    }

    if (loading && applicationsLoading) return <div className="text-center py-16 text-xl text-gray-500">Loading admin data…</div>;

    // --- Handlers ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setUploadError('No file selected.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image size must be less than 5MB.');
            return;
        }

        const data = new FormData();
        data.append('file', file);
        setUploadingImage(true);
        setUploadError('');

        try {
            console.log('Uploading image:', file.name, file.size, file.type);
            // Don't set Content-Type manually - axios will set it automatically with boundary for FormData
            const res = await axios.post(`${API_ROOT}/pets/upload-image`, data, {
                timeout: 30000, // 30 second timeout
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            });
            
            console.log('Upload response:', res.data);
            
            // Handle different response structures
            let imageUrl = null;
            if (res.data) {
                if (res.data.url) {
                    imageUrl = res.data.url;
                } else if (typeof res.data === 'string') {
                    // If response is just a string URL
                    imageUrl = res.data;
                } else if (res.data.data && res.data.data.url) {
                    imageUrl = res.data.data.url;
                }
            }
            
            if (imageUrl) {
                console.log('Setting image_url to:', imageUrl);
                // Use functional update to ensure we get the latest state
                setFormData(prev => {
                    const updated = { ...prev, image_url: imageUrl };
                    console.log('Updated formData with image_url:', updated.image_url);
                    // Verify the update worked
                    setTimeout(() => {
                        setFormData(current => {
                            console.log('Verification - Current image_url in state:', current.image_url);
                            return current;
                        });
                    }, 100);
                    return updated;
                });
                setUploadError(''); // Clear any previous errors
                setMessage('Image uploaded successfully! ✅ You can now submit the form.');
                // Don't auto-clear the success message - let user see it
            } else {
                console.error('Invalid response structure - no URL found:', res.data);
                throw new Error('Invalid response from server - missing url field');
            }
        } catch (err) {
            console.error('Failed to upload image:', err);
            console.error('Error details:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || 
                           err.message || 
                           'Failed to upload image. Please check your connection and try again.';
            setUploadError(errorMsg);
            setFormData(prev => ({ ...prev, image_url: '' })); // Clear image_url on error
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
        
        // Use ref to get the latest formData value to avoid closure issues
        const currentFormData = formDataRef.current;
        const imageUrl = currentFormData.image_url;
        
        console.log('Form data before submit (from ref):', currentFormData);
        console.log('Form data from state:', formData);
        console.log('Image URL from ref:', imageUrl);
        console.log('Image URL from state:', formData.image_url);
        console.log('Image URL type:', typeof imageUrl);
        console.log('Image URL truthy?', !!imageUrl);
        console.log('Image URL length:', imageUrl?.length);
        
        // More robust validation - check if image_url exists and is a non-empty string
        if (!imageUrl || (typeof imageUrl === 'string' && imageUrl.trim() === '') || imageUrl === null || imageUrl === undefined) {
            console.error('Validation failed - image_url is missing or empty');
            console.error('Current formData from ref:', currentFormData);
            console.error('Current formData from state:', formData);
            setMessage('Please upload a pet photo before publishing.');
            setUploadError('Please upload a pet photo before publishing.');
            setTimeout(() => setMessage(''), 5000);
            return;
        }
        
        // Additional validation - ensure it's a valid URL format
        if (typeof imageUrl === 'string' && !imageUrl.startsWith('http') && !imageUrl.startsWith('/uploads/')) {
            console.warn('Image URL format might be invalid:', imageUrl);
            // Still allow it, but log a warning
        }
        
        console.log('Validation passed - proceeding with submission');
        console.log('Submitting pet with image_url:', imageUrl);
        setFormLoading(true);

        try {
            const petData = {
                ...currentFormData,
                age: parseInt(currentFormData.age, 10),
                addedBy: user.user_id || user.id
            };

            console.log('Pet data being sent:', petData);
            const response = await axios.post(`${API_ROOT}/pets`, petData);
            console.log('Pet created response:', response.data);
            console.log('Created pet ID:', response.data?.pet_id || response.data?.id);
            console.log('Created pet status:', response.data?.status);
            
            // Close form and reset
            setShowForm(false);
            setFormData(initialFormData);
            formDataRef.current = initialFormData;
            // Reset file input
            const fileInput = document.getElementById('pet-image-upload');
            if (fileInput) fileInput.value = '';
            
            // Reload pets list - await to ensure it completes
            console.log('Reloading pets list...');
            await loadPets();
            console.log('Pets list reloaded. Current filter:', filter);
            
            // Ensure filter is set to 'All' to show the new pet
            if (filter !== 'All') {
                console.log('Resetting filter to All to show new pet');
                setFilter('All');
            }
            
            setMessage('Pet created successfully! 🎉');
            
        } catch (err) {
            console.error('Failed to create pet:', err);
            console.error('Error response:', err.response?.data);
            const errorMsg = err.response?.data?.message || 'Failed to create pet. Check form data and try again.';
            setMessage(errorMsg);
        } finally {
            setFormLoading(false);
            setTimeout(() => setMessage(''), 5000);
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

    const handleApplicationStatus = async (application, status) => {
        try {
            const updateData = {
                status: status,
                reviewed_by: user.user_id || user.id
            };
            await axios.put(`${API_ROOT}/applications/${application.application_id}`, updateData);
            setMessage(`Application ${status.toLowerCase()} successfully!`);
            loadApplications(); // Reload applications
            loadPets(); // Reload pets in case status changed
            // If on history tab, reload history to show updated status
            if (activeTab === 'history') {
                loadHistory();
            }
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Failed to update application:', err);
            setMessage('Failed to update application status.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // --- JSX Render ---
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="page-header mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
                <p className="text-gray-500">Manage pet posts, adoption applications, and statuses.</p>
            </div>

            {/* Tab Navigation - Enhanced */}
            <div className="admin-tabs-container">
                <nav className="admin-tabs-nav">
                    <button
                        onClick={() => {
                            setActiveTab('pets');
                            setMessage(''); // Clear messages when switching tabs
                        }}
                        className={`admin-tab ${activeTab === 'pets' ? 'active' : ''}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Pets Management</span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('applications');
                            setMessage(''); // Clear messages when switching tabs
                            if (applications.length === 0 && !applicationsLoading) {
                                loadApplications(); // Reload if empty
                            }
                        }}
                        className={`admin-tab ${activeTab === 'applications' ? 'active' : ''}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Adoption Applications</span>
                        {Array.isArray(applications) && applications.filter(app => app.status === 'Pending').length > 0 && (
                            <span className="admin-tab-badge">
                                {applications.filter(app => app.status === 'Pending').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('history');
                            setMessage(''); // Clear messages when switching tabs
                            // Reload history when switching to history tab
                            loadHistory();
                        }}
                        className={`admin-tab ${activeTab === 'history' ? 'active' : ''}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>History</span>
                    </button>
                </nav>
            </div>

            {/* Message Bar */}
            {message && (
                <div className={`admin-message-bar ${message.includes('success') || message.includes('updated') || message.includes('created') || message.includes('deleted') ? 'success' : 'error'}`}>
                    <span>{message}</span>
                    <button 
                        onClick={() => setMessage('')}
                        className="admin-message-close"
                        aria-label="Close message"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Pets Management Tab */}
            {activeTab === 'pets' && (
                <>
                    {/* Admin Toolbar */}
                    <div className="flex justify-between items-center mb-6 admin-toolbar">
                        <div className="filters">
                            <span className="filters-label">Filter by status:</span>
                            <div className="filters-pills" role="tablist" aria-label="Filter pets by status">
                                {['All', 'Available', 'Pending', 'Adopted'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        className={`filter-pill ${filter === status ? 'active' : ''}`}
                                        onClick={() => setFilter(status)}
                                        role="tab"
                                        aria-selected={filter === status}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
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
                                <label htmlFor="pet-image-upload" className="block text-sm font-medium text-gray-700">Pet Photo *</label>
                                {formData.image_url ? (
                                    <div className="space-y-2">
                                        <div className="image-preview w-40 h-40 border-2 border-green-500 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm">
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
                                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
                                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Image ready: {formData.image_url.substring(formData.image_url.lastIndexOf('/') + 1)}
                                        </p>
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
                                        id="pet-image-upload"
                                        autoComplete="off"
                                        aria-label="Upload pet photo"
                                    />
                                    {uploadingImage && (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                            <p className="text-sm text-gray-600">Uploading image…</p>
                                        </div>
                                    )}
                                    {uploadError && (
                                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                            {uploadError}
                                        </p>
                                    )}
                                    {formData.image_url && !uploadingImage && (
                                        <div className="flex items-center gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
                                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="text-sm text-green-600">Image uploaded successfully</span>
                                            <button
                                                type="button"
                                                className="text-xs text-red-600 underline ml-2"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, image_url: '' }));
                                                    setUploadError('');
                                                    // Reset file input
                                                    const fileInput = document.getElementById('pet-image-upload');
                                                    if (fileInput) fileInput.value = '';
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
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
                </>
            )}

            {/* Adoption Applications Tab */}
            {activeTab === 'applications' && (
                <>
                    {/* Applications Filter */}
                    <div className="flex justify-between items-center applications-filter-section">
                        <div className="filters">
                            <span className="filters-label">Filter by status:</span>
                            <div className="filters-pills" role="tablist" aria-label="Filter applications by status">
                                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        className={`filter-pill ${appFilter === status ? 'active' : ''}`}
                                        onClick={() => setAppFilter(status)}
                                        role="tab"
                                        aria-selected={appFilter === status}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Applications Table */}
                    {applicationsLoading ? (
                        <div className="text-center py-16 text-xl text-gray-500">Loading applications…</div>
                    ) : (
                        <div className="admin-applications-table">
                            <div className="admin-applications-header">
                                <span>Pet</span>
                                <span>Applicant</span>
                                <span>Application Date</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            <div className="admin-applications-body">
                                {filteredApplications.length === 0 ? (
                                    <div className="admin-applications-empty">
                                        No applications found in the "{appFilter}" category.
                                    </div>
                                ) : (
                                    filteredApplications.map((app) => (
                                        <div key={app.application_id} className="admin-applications-row">
                                            <div className="application-pet">
                                                <div className="application-pet-content">
                                                    {app.pet?.image_url ? (
                                                        <img
                                                            src={app.pet.image_url}
                                                            alt={app.pet.name || 'Pet'}
                                                            className="application-pet-image"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = '<div class="application-pet-placeholder">No Image</div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="application-pet-placeholder">No Image</div>
                                                    )}
                                                    <div className="application-pet-info">
                                                        <p className="application-pet-name">{app.pet?.name || 'Unknown Pet'}</p>
                                                        <small className="application-pet-details">
                                                            {app.pet?.breed || 'N/A'} • {app.pet?.age || 'N/A'} years
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="application-applicant">
                                                <p className="application-applicant-name">{app.user?.name || 'Unknown User'}</p>
                                                <small className="application-applicant-email">{app.user?.email || 'N/A'}</small>
                                            </div>
                                            <div className="application-date">
                                                {app.application_date
                                                    ? new Date(app.application_date).toLocaleDateString('en-US', {
                                                          year: 'numeric',
                                                          month: 'short',
                                                          day: 'numeric'
                                                      })
                                                    : 'N/A'}
                                            </div>
                                            <div className={`application-status status-${String(app.status || 'pending').toLowerCase()}`}>
                                                <span className="status-badge">{app.status || 'Pending'}</span>
                                            </div>
                                            <div className="application-actions">
                                                {app.status === 'Pending' && (
                                                    <div className="application-action-buttons">
                                                        <button
                                                            onClick={() => handleApplicationStatus(app, 'Approved')}
                                                            className="application-btn application-btn-approve"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApplicationStatus(app, 'Rejected')}
                                                            className="application-btn application-btn-reject"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {app.status !== 'Pending' && app.reviewedBy && (
                                                    <small className="application-reviewed">
                                                        Reviewed by {app.reviewedBy.name || app.reviewedBy.email}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <>
                    {historyLoading ? (
                        <div className="text-center py-16 text-xl text-gray-500">Loading history…</div>
                    ) : (
                        <div className="admin-history-container">
                            <div className="admin-history-section">
                                <h3 className="admin-history-title">All Donations</h3>
                                {donations.length === 0 ? (
                                    <div className="admin-history-empty">
                                        No donations found.
                                    </div>
                                ) : (
                                    <div className="admin-history-table">
                                        <div className="admin-history-header">
                                            <span>User</span>
                                            <span>Amount</span>
                                            <span>Pet</span>
                                            <span>Payment Method</span>
                                            <span>Date</span>
                                            <span>Status</span>
                                        </div>
                                        <div className="admin-history-body">
                                            {donations.map((donation) => (
                                                <div key={donation.donation_id} className="admin-history-row">
                                                    <div className="history-user">
                                                        <p className="history-user-name">{donation.user?.name || 'Unknown User'}</p>
                                                        <small className="history-user-email">{donation.user?.email || 'N/A'}</small>
                                                    </div>
                                                    <div className="history-amount">
                                                        ₱{donation.amount?.toFixed(2) || '0.00'}
                                                    </div>
                                                    <div className="history-pet">
                                                        {donation.pet ? (
                                                            <>
                                                                {donation.pet.image_url && (
                                                                    <img
                                                                        src={donation.pet.image_url}
                                                                        alt={donation.pet.name}
                                                                        className="history-pet-image"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                )}
                                                                <span>{donation.pet.name || 'N/A'}</span>
                                                            </>
                                                        ) : (
                                                            <span className="history-no-pet">General Donation</span>
                                                        )}
                                                    </div>
                                                    <div className="history-method">
                                                        {donation.payment_method || 'N/A'}
                                                    </div>
                                                    <div className="history-date">
                                                        {donation.donation_date
                                                            ? new Date(donation.donation_date).toLocaleString('en-US', {
                                                                  year: 'numeric',
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                                  hour12: true
                                                              })
                                                            : 'N/A'}
                                                    </div>
                                                    <div className={`history-status status-${(donation.status || 'pending').toLowerCase()}`}>
                                                        <span className="status-badge">{donation.status || 'Pending'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="admin-history-section">
                                <h3 className="admin-history-title">All Adoptions</h3>
                                {applications.length === 0 ? (
                                    <div className="admin-history-empty">
                                        No adoption applications found.
                                    </div>
                                ) : (
                                    <div className="admin-history-table">
                                        <div className="admin-history-header">
                                            <span>Pet</span>
                                            <span>Applicant</span>
                                            <span>Application Date</span>
                                            <span>Status</span>
                                            <span>Reviewed By</span>
                                        </div>
                                        <div className="admin-history-body">
                                            {applications.map((app) => (
                                                <div key={app.application_id} className="admin-history-row">
                                                    <div className="history-pet">
                                                        {app.pet?.image_url && (
                                                            <img
                                                                src={app.pet.image_url}
                                                                alt={app.pet.name || 'Pet'}
                                                                className="history-pet-image"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <div className="history-pet-info">
                                                            <span className="history-pet-name">{app.pet?.name || 'Unknown Pet'}</span>
                                                            <small className="history-pet-details">
                                                                {app.pet?.breed || 'N/A'} • {app.pet?.age || 'N/A'} years
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="history-user">
                                                        <p className="history-user-name">{app.user?.name || 'Unknown User'}</p>
                                                        <small className="history-user-email">{app.user?.email || 'N/A'}</small>
                                                    </div>
                                                    <div className="history-date">
                                                        {app.application_date
                                                            ? new Date(app.application_date).toLocaleString('en-US', {
                                                                  year: 'numeric',
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                                  hour12: true
                                                              })
                                                            : 'N/A'}
                                                    </div>
                                                    <div className={`history-status status-${(app.status || 'pending').toLowerCase()}`}>
                                                        <span className="status-badge">{app.status || 'Pending'}</span>
                                                    </div>
                                                    <div className="history-reviewed">
                                                        {app.reviewedBy ? (
                                                            <>
                                                                <span className="history-reviewed-name">{app.reviewedBy.name || app.reviewedBy.email}</span>
                                                                {app.reviewedBy.email && app.reviewedBy.name && (
                                                                    <small className="history-reviewed-email">{app.reviewedBy.email}</small>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="history-not-reviewed">Not reviewed</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Helper component for form groups
// Map field names to appropriate autocomplete values
const getAutocompleteValue = (name, type) => {
    if (type === 'file') return 'off';
    
    const autocompleteMap = {
        'name': 'name',
        'breed': 'off',
        'age': 'off',
        'gender': 'sex',
        'species': 'off',
        'status': 'off',
        'description': 'off',
    };
    
    return autocompleteMap[name] || 'off';
};

const FormGroup = ({ label, name, value, onChange, type = 'text', options, ...props }) => {
    const autocompleteValue = getAutocompleteValue(name, type);
    
    return (
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
                    autoComplete={autocompleteValue}
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
                    autoComplete={autocompleteValue}
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
                    autoComplete={autocompleteValue}
                    {...props}
                />
            )}
        </div>
    );
};
