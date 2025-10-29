import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import EmissionChart from '../components/EmissionChart';
import styles from './Analytics.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const Analytics = () => {
  const { user, token } = useContext(AuthContext);
  const { socket, connected } = useSocket(token);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/emissions/stats?timeRange=${timeRange}`);
        setStats(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newEmission', () => {
      // Refresh stats when new emission is added
      const fetchStats = async () => {
        try {
          const response = await axios.get(`${API_URL}/emissions/stats?timeRange=${timeRange}`);
          setStats(response.data.data);
        } catch (error) {
          console.error('Error fetching updated stats:', error);
        }
      };
      fetchStats();
    });

    return () => {
      socket.off('newEmission');
    };
  }, [socket, timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-primary">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.analyticsContainer}>
        <div className={styles.analyticsHeader}>
          <h1 className={styles.analyticsTitle}>Analytics Dashboard</h1>
          <p className={styles.analyticsSubtitle}>
            Detailed insights into your carbon footprint over time
          </p>
          {connected && (
            <span className={styles.statusBadge}>
              <span className={styles.statusIndicator}>🟢</span>
              Real-time updates active
            </span>
          )}
        </div>

        {/* Time Range Selector */}
        <div className={styles.timeRangeSelector}>
          <label htmlFor="timeRange" className={styles.timeRangeLabel}>
            Time Range
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.timeRangeSelect}
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon + ' ' + styles.statIconBlue}>
                <span className={styles.statIconText}>∑</span>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statLabel}>Total Emissions</h3>
                <p className={styles.statValue}>
                  {stats.totalEmissions?.toFixed(2) || 0}
                  <span className={styles.statUnit}>kg CO₂</span>
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon + ' ' + styles.statIconGreen}>
                <span className={styles.statIconText}>📊</span>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statLabel}>Average per Entry</h3>
                <p className={styles.statValue}>
                  {stats.averageEmission?.toFixed(2) || 0}
                  <span className={styles.statUnit}>kg CO₂</span>
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon + ' ' + styles.statIconYellow}>
                <span className={styles.statIconText}>#</span>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statLabel}>Total Entries</h3>
                <p className={styles.statValue}>
                  {stats.totalEntries || 0}
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon + ' ' + styles.statIconRed}>
                <span className={styles.statIconText}>↑</span>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statLabel}>Highest Emission</h3>
                <p className={styles.statValue}>
                  {stats.highestEmission?.toFixed(2) || 0}
                  <span className={styles.statUnit}>kg CO₂</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {stats && (
          <div className={styles.chartsSection}>
            <h2 className={styles.chartsTitle}>Emissions Breakdown</h2>
            <EmissionChart stats={stats} />
          </div>
        )}

        {/* Category Breakdown */}
        {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
          <div className={styles.categoryBreakdown}>
            <h2 className={styles.categoryTitle}>Category Breakdown</h2>
            <div className={styles.tableContainer}>
              <table className={styles.categoryTable}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Emissions</th>
                    <th>Entries</th>
                    <th>Average</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categoryBreakdown.map((category) => (
                    <tr key={category._id}>
                      <td className={styles.categoryName}>
                        {category._id}
                      </td>
                      <td className={styles.categoryEmission}>
                        {category.totalEmissions.toFixed(2)} kg CO₂
                      </td>
                      <td className={styles.categoryCount}>
                        {category.count}
                      </td>
                      <td className={styles.categoryAverage}>
                        {category.average.toFixed(2)} kg CO₂
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
