import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import styles from './Profile.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const { socket, connected } = useSocket(token);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`);
        setProfileData(response.data.data);
        setFormData({
          name: response.data.data.name,
          email: response.data.data.email
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const response = await axios.put(`${API_URL}/auth/profile`, formData);
      setProfileData(response.data.data);
      setEditing(false);
      // Update context if name changed
      if (formData.name !== user.name) {
        // This would require updating the AuthContext
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-primary">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1 className={styles.profileTitle}>Profile Settings</h1>
          <p className={styles.profileSubtitle}>
            Manage your account information and preferences
          </p>
          {connected && (
            <span className={styles.statusBadge}>
              <span className={styles.statusIndicator}>🟢</span>
              Real-time updates active
            </span>
          )}
        </div>

        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Personal Information</h2>
          </div>

          <div className={styles.profileInfo}>
            {!editing ? (
              <>
                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Name</label>
                  <p className={styles.infoValue}>{profileData?.name}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Email</label>
                  <p className={styles.infoValue}>{profileData?.email}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Member Since</label>
                  <p className={styles.infoValue}>
                    {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className={styles.buttonGroup}>
                  <button
                    onClick={() => setEditing(true)}
                    className={styles.primaryButton}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={logout}
                    className={styles.logoutButton}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdate} className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className={styles.primaryButton}
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profileData?.name,
                        email: profileData?.email
                      });
                    }}
                    className={styles.secondaryButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Account Statistics */}
        <div className={styles.statsCard}>
          <h2 className={styles.statsTitle}>Account Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {profileData?.emissionCount || 0}
              </div>
              <div className={styles.statLabel}>Total Emissions Logged</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {profileData?.totalEmissions?.toFixed(2) || 0}
              </div>
              <div className={styles.statLabel}>Total CO₂ (kg)</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {profileData?.averageEmission?.toFixed(2) || 0}
              </div>
              <div className={styles.statLabel}>Average per Entry</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
