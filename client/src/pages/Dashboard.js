import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityAPI } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'];

  const categoryEmojis = {
    transportation: '🚗',
    energy: '⚡',
    food: '🍽️',
    waste: '🗑️',
    shopping: '🛍️'
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      let startDate = new Date();

      if (timeRange === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (timeRange === 'year') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      const [statsResponse, activitiesResponse] = await Promise.all([
        activityAPI.getStatistics({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
        activityAPI.getAll()
      ]);

      setStatistics(statsResponse.data);
      setRecentActivities(activitiesResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = () => {
    if (!statistics || !statistics.byCategory) return [];
    return statistics.byCategory.map((cat) => ({
      name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
      value: parseFloat(cat.totalFootprint.toFixed(2)),
      count: cat.count
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Carbon Footprint Dashboard</h1>
        <div className="time-range-selector">
          <button
            className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <h3>Total Footprint</h3>
            <p className="stat-value">{statistics?.total?.toFixed(2) || 0}</p>
            <span className="stat-unit">kg CO₂</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Activities Logged</h3>
            <p className="stat-value">
              {statistics?.byCategory?.reduce((sum, cat) => sum + cat.count, 0) || 0}
            </p>
            <span className="stat-unit">total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Daily Average</h3>
            <p className="stat-value">
              {(
                (statistics?.total || 0) /
                (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365)
              ).toFixed(2)}
            </p>
            <span className="stat-unit">kg CO₂/day</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <h2>Emissions by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4CAF50" name="kg CO₂" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getCategoryData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getCategoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-activities-card">
        <div className="card-header">
          <h2>Recent Activities</h2>
          <Link to="/activities" className="view-all-link">
            View All →
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div className="empty-state">
            <p>No activities logged yet</p>
            <Link to="/add-activity" className="btn btn-primary">
              Add Your First Activity
            </Link>
          </div>
        ) : (
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity._id} className="activity-item">
                <div className="activity-icon">
                  {categoryEmojis[activity.category] || '📋'}
                </div>
                <div className="activity-details">
                  <h4>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</h4>
                  <p>
                    {activity.amount} {activity.unit} • {formatDate(activity.date)}
                  </p>
                </div>
                <div className="activity-footprint">
                  <span className="footprint-value">{activity.carbonFootprint.toFixed(2)}</span>
                  <span className="footprint-unit">kg CO₂</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tips-card">
        <h2>💡 Tips to Reduce Your Carbon Footprint</h2>
        <ul className="tips-list">
          <li>Use public transportation or carpool when possible</li>
          <li>Switch to LED bulbs and unplug devices when not in use</li>
          <li>Reduce meat consumption and choose local produce</li>
          <li>Recycle and compost to minimize waste</li>
          <li>Choose sustainable products and buy second-hand when possible</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;