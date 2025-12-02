import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./Profile.css";

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
        {!editing && (
          <button className="btn-edit" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className={`profile-message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </div>
      )}

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
    </div>
  );
}

