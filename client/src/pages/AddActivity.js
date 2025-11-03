import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityAPI } from '../services/api';
import '../styles/AddActivity.css';

const AddActivity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emissionFactors, setEmissionFactors] = useState(null);
  const [formData, setFormData] = useState({
    category: 'transportation',
    type: '',
    amount: '',
    unit: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [estimatedFootprint, setEstimatedFootprint] = useState(0);

  const categoryOptions = {
    transportation: [
      { value: 'car', label: 'Car', unit: 'km' },
      { value: 'bus', label: 'Bus', unit: 'km' },
      { value: 'train', label: 'Train', unit: 'km' },
      { value: 'flight', label: 'Flight', unit: 'km' },
      { value: 'motorcycle', label: 'Motorcycle', unit: 'km' },
      { value: 'bicycle', label: 'Bicycle', unit: 'km' }
    ],
    energy: [
      { value: 'electricity', label: 'Electricity', unit: 'kWh' },
      { value: 'naturalGas', label: 'Natural Gas', unit: 'm³' },
      { value: 'heating', label: 'Heating Oil', unit: 'L' }
    ],
    food: [
      { value: 'beef', label: 'Beef', unit: 'kg' },
      { value: 'pork', label: 'Pork', unit: 'kg' },
      { value: 'chicken', label: 'Chicken', unit: 'kg' },
      { value: 'fish', label: 'Fish', unit: 'kg' },
      { value: 'vegetables', label: 'Vegetables', unit: 'kg' },
      { value: 'dairy', label: 'Dairy Products', unit: 'kg' }
    ],
    waste: [
      { value: 'general', label: 'General Waste', unit: 'kg' },
      { value: 'recycling', label: 'Recycling', unit: 'kg' },
      { value: 'compost', label: 'Compost', unit: 'kg' }
    ],
    shopping: [
      { value: 'clothing', label: 'Clothing', unit: 'item' },
      { value: 'electronics', label: 'Electronics', unit: 'item' },
      { value: 'furniture', label: 'Furniture', unit: 'item' }
    ]
  };

  useEffect(() => {
    fetchEmissionFactors();
  }, []);

  useEffect(() => {
    calculateEstimatedFootprint();
  }, [formData.category, formData.type, formData.amount, emissionFactors]);

  const fetchEmissionFactors = async () => {
    try {
      const response = await activityAPI.getEmissionFactors();
      setEmissionFactors(response.data);
    } catch (error) {
      console.error('Failed to fetch emission factors:', error);
    }
  };

  const calculateEstimatedFootprint = () => {
    if (!emissionFactors || !formData.type || !formData.amount) {
      setEstimatedFootprint(0);
      return;
    }

    const categoryFactors = emissionFactors[formData.category];
    if (categoryFactors && categoryFactors[formData.type]) {
      const factor = categoryFactors[formData.type].factor;
      const estimated = parseFloat(formData.amount) * factor;
      setEstimatedFootprint(isNaN(estimated) ? 0 : estimated);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    const options = categoryOptions[category];
    setFormData({
      ...formData,
      category,
      type: options[0]?.value || '',
      unit: options[0]?.unit || ''
    });
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const option = categoryOptions[formData.category].find((opt) => opt.value === type);
    setFormData({
      ...formData,
      type,
      unit: option?.unit || ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await activityAPI.create(formData);
      navigate('/activities');
    } catch (error) {
      console.error('Failed to create activity:', error);
      alert('Failed to add activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-activity-container">
      <div className="add-activity-card">
        <h1>Add New Activity</h1>
        <p className="subtitle">Track your carbon footprint by logging your daily activities</p>

        <form onSubmit={handleSubmit} className="activity-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="transportation">🚗 Transportation</option>
                <option value="energy">⚡ Energy</option>
                <option value="food">🍽️ Food</option>
                <option value="waste">🗑️ Waste</option>
                <option value="shopping">🛍️ Shopping</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                required
              >
                {categoryOptions[formData.category]?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter amount"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={formData.unit}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Add any additional details..."
            />
          </div>

          {estimatedFootprint > 0 && (
            <div className="estimated-footprint">
              <div className="footprint-label">Estimated Carbon Footprint:</div>
              <div className="footprint-value">
                {estimatedFootprint.toFixed(2)} <span>kg CO₂</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/activities')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>

      <div className="info-card">
        <h3>💡 How It Works</h3>
        <p>
          Our carbon calculator uses industry-standard emission factors to estimate the
          environmental impact of your activities. The more accurately you log your activities,
          the better insights you'll get about your carbon footprint.
        </p>
      </div>
    </div>
  );
};

export default AddActivity;