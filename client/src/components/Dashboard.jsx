// client/src/components/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import EmissionForm from './EmissionForm';
import EmissionChart from './EmissionChart';
import styles from './Dashboard.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const { socket, connected } = useSocket(token);
  const [emissions, setEmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emissionsRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/emissions?limit=10`),
          axios.get(`${API_URL}/emissions/stats`)
        ]);

        setEmissions(emissionsRes.data.data.emissions);
        setStats(statsRes.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newEmission', (data) => {
      setEmissions((prev) => [data.emission, ...prev.slice(0, 9)]);
      setStats((prev) => ({
        ...prev,
        totalEmissions: data.totalEmissions
      }));
    });

    return () => {
      socket.off('newEmission');
    };
  }, [socket]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back, {user?.name}! 👋</h1>
          <p className={styles.subtitle}>
            Track your carbon footprint and contribute to SDG 13: Climate Action
          </p>
          {connected && (
            <span className={styles.statusBadge}>
              <span className={styles.statusIndicator}>🟢</span>
              Real-time updates active
            </span>
          )}
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Total Emissions</h3>
            <p className={styles.statValue}>
              {stats?.totalEmissions?.toFixed(2) || 0}
              <span className={styles.statUnit}>kg CO₂</span>
            </p>
          </div>
          
          {stats?.categoryBreakdown?.map((cat) => (
            <div key={cat._id} className={styles.statCard}>
              <h3 className={styles.statLabel} style={{ textTransform: 'capitalize' }}>
                {cat._id}
              </h3>
              <p className={styles.statValue}>
                {cat.totalEmissions.toFixed(2)}
                <span className={styles.statUnit}>kg CO₂</span>
              </p>
              <p className={styles.statMeta}>{cat.count} entries</p>
            </div>
          ))}
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Add New Emission</h2>
            <EmissionForm onSuccess={(newEmission) => {
              setEmissions([newEmission, ...emissions.slice(0, 9)]);
            }} />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Activity</h2>
            <div className={styles.activityList}>
              {emissions.length === 0 ? (
                <p className={styles.emptyState}>
                  No emissions recorded yet. Start tracking!
                </p>
              ) : (
                emissions.map((emission) => (
                  <div key={emission._id} className={styles.activityItem}>
                    <div className={styles.activityInfo}>
                      <p className={styles.activityCategory}>{emission.category}</p>
                      <p className={styles.activitySubcategory}>{emission.subcategory}</p>
                    </div>
                    <div className={styles.activityStats}>
                      <p className={styles.activityEmission}>
                        {emission.carbonEmission.toFixed(2)} kg CO₂
                      </p>
                      <p className={styles.activityDate}>
                        {new Date(emission.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {stats && (
          <div className={styles.chartSection}>
            <h2 className={styles.cardTitle}>Emissions Breakdown</h2>
            <EmissionChart stats={stats} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
