// client/src/components/EmissionForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from './EmissionForm.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const CATEGORIES = {
  transportation: {
    label: 'Transportation',
    subcategories: [
      'car_gasoline', 'car_diesel', 'car_electric', 'motorcycle',
      'bus', 'train', 'flight_short', 'flight_medium', 'flight_long'
    ],
    unit: 'km'
  },
  electricity: {
    label: 'Electricity',
    subcategories: ['grid_average', 'renewable', 'coal', 'natural_gas'],
    unit: 'kWh'
  },
  food: {
    label: 'Food',
    subcategories: [
      'beef', 'lamb', 'pork', 'chicken', 'fish', 'eggs',
      'cheese', 'milk', 'rice', 'vegetables', 'fruits'
    ],
    unit: 'kg'
  },
  waste: {
    label: 'Waste',
    subcategories: ['landfill', 'recycling', 'composting', 'incineration'],
    unit: 'kg'
  }
};

const EmissionForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'transportation',
    subcategory: 'car_gasoline',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_URL}/emissions`, {
        category: formData.category,
        subcategory: formData.subcategory,
        amount: parseFloat(formData.amount),
        unit: CATEGORIES[formData.category].unit,
        description: formData.description,
        metadata: {
          vehicleType: formData.category === 'transportation' ? formData.subcategory : undefined
        }
      });

      setMessage({
        type: 'success',
        text: `Emission recorded: ${response.data.data.emission.carbonEmission.toFixed(2)} kg CO₂`
      });

      setFormData({
        ...formData,
        amount: '',
        description: ''
      });

      if (onSuccess) {
        onSuccess(response.data.data.emission);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to record emission'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData({
      ...formData,
      category,
      subcategory: CATEGORIES[category].subcategories[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {message.text && (
        <div className={message.type === 'success' ? styles.alertSuccess : styles.alertError}>
          {message.text}
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Category</label>
        <select
          value={formData.category}
          onChange={handleCategoryChange}
          className={styles.select}
        >
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Type</label>
        <select
          value={formData.subcategory}
          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
          className={styles.select}
        >
          {CATEGORIES[formData.category].subcategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Amount ({CATEGORIES[formData.category].unit})
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className={styles.input}
          placeholder={`Enter amount in ${CATEGORIES[formData.category].unit}`}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Description (Optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={styles.textarea}
          placeholder="Add notes about this emission..."
        />
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Recording...' : 'Record Emission'}
      </button>
    </form>
  );
};

export default EmissionForm;
