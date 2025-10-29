// client/src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🌍</span>
            <span className={styles.logoText}>Carbon Tracker</span>
            <span className={styles.sdgBadge}>SDG 13</span>
          </Link>

          <div className={styles.navLinks}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={styles.navLink}>
                  Dashboard
                </Link>
                <Link to="/analytics" className={styles.navLink}>
                  Analytics
                </Link>
                <Link to="/profile" className={styles.navLink}>
                  Profile
                </Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginLink}>
                  Login
                </Link>
                <Link to="/register" className={styles.signupButton}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
