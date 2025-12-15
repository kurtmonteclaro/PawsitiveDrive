import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./Profile.css";
import "../pages/Donate.css";

const API_ROOT = process.env.REACT_APP_API_BASE ?? 'http://localhost:8080/api';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'history'
  const [donations, setDonations] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [donationsCurrentPage, setDonationsCurrentPage] = useState(1);
  const donationsItemsPerPage = 6;
  
  const [formData, setFormData] = useState({
    bio: "",
    profile_picture: ""
  });

  const loadProfile = useCallback(async (skipLoadingState = false) => {
    if (!user?.user_id && !user?.id) {
      if (!skipLoadingState) setLoading(false);
      return;
    }

    try {
      const userId = user.user_id || user.id;
      const res = await axios.get(`${API_ROOT}/profiles/user/${userId}`);
      // Extract the data we need
      const profileData = {
        profile_id: res.data.profile_id,
        bio: res.data.bio || "",
        profile_picture: res.data.profile_picture || ""
      };
      setProfile(profileData);
      setFormData({
        bio: profileData.bio,
        profile_picture: profileData.profile_picture
      });
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile doesn't exist yet, that's okay
        console.log("Profile not found (404), will be created on save");
        setProfile(null);
        setFormData({ bio: "", profile_picture: "" });
      } else {
        console.error("Failed to load profile:", err);
        console.error("Error details:", err.response?.data);
        setMessage("Failed to load profile.");
      }
    } finally {
      if (!skipLoadingState) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user, loadProfile]);

  const loadHistory = useCallback(async () => {
    if (!user?.user_id && !user?.id) return;
    
    setHistoryLoading(true);
    try {
      const userId = user.user_id || user.id;
      console.log('Loading history for user:', userId);
      const [donationsRes, adoptionsRes] = await Promise.all([
        axios.get(`${API_ROOT}/donations/user/${userId}`),
        axios.get(`${API_ROOT}/applications/user/${userId}`)
      ]);
      console.log('User donations response:', donationsRes.data);
      console.log('User donations count:', Array.isArray(donationsRes.data) ? donationsRes.data.length : 'Not an array');
      const donationsData = Array.isArray(donationsRes.data) ? donationsRes.data : [];
      // Sort donations by date (newest first)
      const sortedDonations = [...donationsData].sort((a, b) => {
        const dateA = a.donation_date ? new Date(a.donation_date).getTime() : 0;
        const dateB = b.donation_date ? new Date(b.donation_date).getTime() : 0;
        return dateB - dateA; // Newest first
      });
      setDonations(sortedDonations);
      const adoptionsData = Array.isArray(adoptionsRes.data) ? adoptionsRes.data : [];
      setAdoptions(adoptionsData);
    } catch (err) {
      console.error("Failed to load history:", err);
      console.error("Error response:", err.response?.data);
      setDonations([]);
      setAdoptions([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "history" && user) {
      loadHistory();
      setDonationsCurrentPage(1); // Reset to page 1 when loading history
    }
  }, [activeTab, user, loadHistory]);

  // Calculate pagination for donations
  const donationsTotalPages = Math.ceil(donations.length / donationsItemsPerPage);
  const donationsStartIndex = (donationsCurrentPage - 1) * donationsItemsPerPage;
  const donationsEndIndex = donationsStartIndex + donationsItemsPerPage;
  const paginatedDonations = donations.slice(donationsStartIndex, donationsEndIndex);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (donationsCurrentPage > donationsTotalPages && donationsTotalPages > 0) {
      setDonationsCurrentPage(1);
    }
  }, [donationsCurrentPage, donationsTotalPages]);

  const handleDonationsPageChange = (page) => {
    setDonationsCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadReceipt = async (donationId) => {
    try {
      const receiptRes = await axios.get(`${API_ROOT}/donations/${donationId}/receipt`);
      if (receiptRes.data) {
        setSelectedReceipt(receiptRes.data);
        setShowReceipt(true);
      } else {
        setMessage("Receipt not found for this donation.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to load receipt:", err);
      if (err.response?.status === 404) {
        setMessage("Receipt not available for this donation. Receipts are only available for donations made after the receipt feature was implemented.");
        setTimeout(() => setMessage(""), 5000);
      } else if (err.response?.status === 403) {
        setMessage("Access denied. Please make sure you're logged in.");
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage("Failed to load receipt. Please try again.");
        setTimeout(() => setMessage(""), 5000);
      }
    }
  };

  const formatPeso = (value) =>
    value.toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    });

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    setUploadingImage(true);
    setUploadError("");

    try {
      const res = await axios.post(`${API_ROOT}/profiles/upload-image`, data);
      setFormData(prev => ({ ...prev, profile_picture: res.data.url }));
      setMessage("Image uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to upload image:", err);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.user_id && !user?.id) {
      setMessage("Please log in to save your profile.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const userId = user.user_id || user.id;
      const res = await axios.put(`${API_ROOT}/profiles/user/${userId}`, formData);
      // Extract the saved data
      const savedProfile = {
        profile_id: res.data.profile_id,
        bio: res.data.bio || "",
        profile_picture: res.data.profile_picture || ""
      };
      // Update state immediately with saved data
      setProfile(savedProfile);
      setFormData({
        bio: savedProfile.bio,
        profile_picture: savedProfile.profile_picture
      });
      setEditing(false);
      setMessage("Profile updated successfully! 🎉");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setMessage(`Failed to save profile: ${err.response?.data?.message || err.message || "Please try again."}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        bio: profile.bio || "",
        profile_picture: profile.profile_picture || ""
      });
    } else {
      setFormData({ bio: "", profile_picture: "" });
    }
    setEditing(false);
    setUploadError("");
    setMessage("");
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-empty">
          <h2>Please Sign In</h2>
          <p>You need to be logged in to view your profile.</p>
          <div className="profile-actions">
            <Link to="/login" className="btn-primary">Sign In</Link>
            <Link to="/signup" className="btn-outline">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  // Use formData when editing, otherwise use profile data, with fallback to formData
  const displayBio = editing ? formData.bio : (profile?.bio || "");
  const displayPicture = editing ? formData.profile_picture : (profile?.profile_picture || "");

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!editing && activeTab === "profile" && (
          <button className="btn-edit" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`profile-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {message && (
        <div className={`profile-message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="profile-content">
        <div className="profile-section profile-picture-section">
          <h2>Profile Picture</h2>
          <div className="profile-picture-container">
            {displayPicture ? (
              <div className="profile-picture-preview">
                <img
                  src={displayPicture}
                  alt="Profile"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="profile-picture-placeholder" style={{ display: "none" }}>
                  <span>Invalid image</span>
                </div>
              </div>
            ) : (
              <div className="profile-picture-placeholder">
                <span>No picture</span>
              </div>
            )}
            
            {editing && (
              <div className="profile-picture-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  id="profile-picture-input"
                  style={{ display: "none" }}
                />
                <label htmlFor="profile-picture-input" className="btn-upload">
                  {uploadingImage ? "Uploading..." : displayPicture ? "Change Picture" : "Upload Picture"}
                </label>
                {uploadingImage && <p className="upload-status">Uploading image…</p>}
                {uploadError && <p className="upload-error">{uploadError}</p>}
                {displayPicture && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => setFormData(prev => ({ ...prev, profile_picture: "" }))}
                  >
                    Remove Picture
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-section profile-info-section">
          <h2>User Information</h2>
          <div className="profile-info">
            <div className="info-item">
              <label>Name</label>
              <p>{user.name || "Not set"}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user.email || "Not set"}</p>
            </div>
            {user.role && (
              <div className="info-item">
                <label>Role</label>
                <p>{user.role.role_name || user.role_name || "Not set"}</p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section profile-bio-section">
          <h2>Bio</h2>
          {editing ? (
            <div className="bio-editor">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="6"
                className="bio-textarea"
              />
              <div className="bio-actions">
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bio-display">
              {displayBio ? (
                <p>{displayBio}</p>
              ) : (
                <p className="bio-empty">No bio added yet. Click "Edit Profile" to add one.</p>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === "history" && (
        <div className="profile-history">
          {historyLoading ? (
            <div className="profile-loading">Loading history...</div>
          ) : (
            <>
              <div className="history-section">
                <h2>My Donations</h2>
                {donations.length === 0 ? (
                  <div className="history-empty">
                    <p>No donations yet. Start making a difference today!</p>
                  </div>
                ) : (
                  <>
                  <div className="history-list">
                    {paginatedDonations.map((donation) => (
                      <div key={donation.donation_id} className="history-item donation-item">
                        <div className="history-item-header">
                          <span className="history-item-type">Donation</span>
                          <span className={`history-item-status status-${(donation.status || "pending").toLowerCase()}`}>
                            {donation.status || "Pending"}
                          </span>
                        </div>
                        <div className="history-item-content">
                          <div className="history-item-main">
                            <span className="history-item-amount">₱{donation.amount?.toFixed(2) || "0.00"}</span>
                            {donation.pet && (
                              <span className="history-item-pet">for {donation.pet.name}</span>
                            )}
                          </div>
                          <div className="history-item-details">
                            <span className="history-item-date">
                              {donation.donation_date
                                ? new Date(donation.donation_date).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                  })
                                : "N/A"}
                            </span>
                            {donation.payment_method && (
                              <span className="history-item-method">{donation.payment_method}</span>
                            )}
                          </div>
                          <div className="history-item-actions">
                            <button
                              className="btn-receipt"
                              onClick={() => loadReceipt(donation.donation_id)}
                            >
                              View Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls for Donations */}
                  {donationsTotalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => handleDonationsPageChange(donationsCurrentPage - 1)}
                        disabled={donationsCurrentPage === 1}
                      >
                        Previous
                      </button>
                      <div className="pagination-pages">
                        {Array.from({ length: donationsTotalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            className={`pagination-page ${donationsCurrentPage === page ? 'active' : ''}`}
                            onClick={() => handleDonationsPageChange(page)}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        className="pagination-btn"
                        onClick={() => handleDonationsPageChange(donationsCurrentPage + 1)}
                        disabled={donationsCurrentPage === donationsTotalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                  </>
                )}
              </div>

              <div className="history-section">
                <h2>My Adoptions</h2>
                {adoptions.length === 0 ? (
                  <div className="history-empty">
                    <p>No adoption applications yet. Browse available pets to get started!</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {adoptions.map((adoption) => (
                      <div key={adoption.application_id} className="history-item adoption-item">
                        <div className="history-item-header">
                          <span className="history-item-type">Adoption Application</span>
                          <span className={`history-item-status status-${(adoption.status || "pending").toLowerCase()}`}>
                            {adoption.status || "Pending"}
                          </span>
                        </div>
                        <div className="history-item-content">
                          {adoption.pet && (
                            <div className="history-item-pet-info">
                              {adoption.pet.image_url && (
                                <img
                                  src={adoption.pet.image_url}
                                  alt={adoption.pet.name}
                                  className="history-item-pet-image"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              )}
                              <div className="history-item-pet-details">
                                <span className="history-item-pet-name">{adoption.pet.name}</span>
                                <span className="history-item-pet-breed">
                                  {adoption.pet.breed} • {adoption.pet.age} years old
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="history-item-details">
                            <span className="history-item-date">
                              Applied on{" "}
                              {adoption.application_date
                                ? new Date(adoption.application_date).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                  })
                                : "N/A"}
                            </span>
                            {adoption.reviewedBy && (
                              <span className="history-item-reviewed">
                                Reviewed by {adoption.reviewedBy.name || adoption.reviewedBy.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {showReceipt && selectedReceipt && (
        <div className="receipt-modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <h2>Donation Receipt</h2>
              <button className="receipt-modal-close" onClick={() => setShowReceipt(false)}>×</button>
            </div>
            <div className="receipt-content">
              <div className="receipt-header">
                <h3>Pawsitive Drive</h3>
                <p>Donation Receipt</p>
              </div>
              
              <div className="receipt-info">
                <div className="receipt-row">
                  <span className="receipt-label">Receipt Number:</span>
                  <span className="receipt-value">{selectedReceipt.receipt_number || 'N/A'}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Date:</span>
                  <span className="receipt-value">
                    {selectedReceipt.receipt_date 
                      ? new Date(selectedReceipt.receipt_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Donor Name:</span>
                  <span className="receipt-value">{selectedReceipt.donor_name || 'N/A'}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Donor Email:</span>
                  <span className="receipt-value">{selectedReceipt.donor_email || 'N/A'}</span>
                </div>
                {selectedReceipt.donor_address && (
                  <div className="receipt-row">
                    <span className="receipt-label">Address:</span>
                    <span className="receipt-value">{selectedReceipt.donor_address}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span className="receipt-label">Payment Method:</span>
                  <span className="receipt-value">{selectedReceipt.payment_method || 'N/A'}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Transaction ID:</span>
                  <span className="receipt-value">{selectedReceipt.transaction_id || 'N/A'}</span>
                </div>
                <div className="receipt-row receipt-amount-row">
                  <span className="receipt-label">Amount:</span>
                  <span className="receipt-amount">
                    {selectedReceipt.donation 
                      ? formatPeso(selectedReceipt.donation.amount || 0)
                      : 'N/A'}
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Status:</span>
                  <span className={`receipt-status status-${(selectedReceipt.status || 'completed').toLowerCase()}`}>
                    {selectedReceipt.status || 'Completed'}
                  </span>
                </div>
              </div>
              
              <div className="receipt-footer">
                <p>Thank you for your generous donation!</p>
                <p className="receipt-note">This receipt serves as proof of your donation.</p>
              </div>
              
              <div className="receipt-actions">
                <button 
                  className="btn primary" 
                  onClick={() => window.print()}
                >
                  Print Receipt
                </button>
                <button 
                  className="btn outline" 
                  onClick={() => setShowReceipt(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

