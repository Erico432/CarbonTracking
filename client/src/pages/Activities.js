import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityAPI } from '../services/api';
import '../styles/Activities.css';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryEmojis = {
    transportation: '🚗',
    energy: '⚡',
    food: '🍽️',
    waste: '🗑️',
    shopping: '🛍️'
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [activities, filter, sortBy, searchTerm]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getAll();
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...activities];

    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter((activity) => activity.category === filter);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'footprint') {
        return b.carbonFootprint - a.carbonFootprint;
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

    setFilteredActivities(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activityAPI.delete(id);
        setActivities(activities.filter((activity) => activity._id !== id));
      } catch (error) {
        console.error('Failed to delete activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
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
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="activities-container">
      <div className="activities-header">
        <h1>Your Activities</h1>
        <Link to="/add-activity" className="btn btn-primary">
          + Add Activity
        </Link>
      </div>

      <div className="activities-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="transportation">Transportation</option>
            <option value="energy">Energy</option>
            <option value="food">Food</option>
            <option value="waste">Waste</option>
            <option value="shopping">Shopping</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="footprint">Sort by Footprint</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No activities found</h3>
          <p>
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'Start tracking your carbon footprint by adding your first activity'}
          </p>
          <Link to="/add-activity" className="btn btn-primary">
            Add Activity
          </Link>
        </div>
      ) : (
        <>
          <div className="activities-summary">
            <p>
              Showing <strong>{filteredActivities.length}</strong> activit
              {filteredActivities.length === 1 ? 'y' : 'ies'}
            </p>
            <p>
              Total Footprint:{' '}
              <strong>
                {filteredActivities
                  .reduce((sum, act) => sum + act.carbonFootprint, 0)
                  .toFixed(2)}{' '}
                kg CO₂
              </strong>
            </p>
          </div>

          <div className="activities-grid">
            {filteredActivities.map((activity) => (
              <div key={activity._id} className="activity-card">
                <div className="activity-card-header">
                  <div className="activity-category">
                    <span className="category-icon">
                      {categoryEmojis[activity.category] || '📋'}
                    </span>
                    <span className="category-name">
                      {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                    </span>
                  </div>
                  <div className="activity-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(activity._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="activity-card-body">
                  <h3>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</h3>
                  <p className="activity-amount">
                    {activity.amount} {activity.unit}
                  </p>
                  {activity.description && (
                    <p className="activity-description">{activity.description}</p>
                  )}
                </div>

                <div className="activity-card-footer">
                  <div className="activity-date">📅 {formatDate(activity.date)}</div>
                  <div className="activity-footprint">
                    <span className="footprint-label">Carbon:</span>
                    <span className="footprint-value">
                      {activity.carbonFootprint.toFixed(2)} kg CO₂
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Activities;