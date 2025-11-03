import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Track Your Carbon Footprint</h1>
          <p className="hero-subtitle">
            Take control of your environmental impact. Monitor, analyze, and reduce your carbon
            emissions with our comprehensive tracking tool.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </Link>
                <Link to="/add-activity" className="btn btn-secondary btn-large">
                  Add Activity
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="earth-animation">🌍</div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Track Your Carbon Footprint?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Analytics</h3>
            <p>
              Visualize your carbon emissions across different categories with interactive charts
              and graphs.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Set Goals</h3>
            <p>
              Track your progress and set reduction goals to minimize your environmental impact
              over time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Get Insights</h3>
            <p>
              Receive personalized recommendations on how to reduce your carbon footprint
              effectively.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Make a Difference</h3>
            <p>Join a community of environmentally conscious individuals working towards a sustainable future.</p>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2>Track Multiple Categories</h2>
        <div className="categories-grid">
          <div className="category-item">
            <span className="category-emoji">🚗</span>
            <h4>Transportation</h4>
            <p>Track your travel emissions from cars, buses, trains, and flights.</p>
          </div>

          <div className="category-item">
            <span className="category-emoji">⚡</span>
            <h4>Energy</h4>
            <p>Monitor your electricity, gas, and heating consumption.</p>
          </div>

          <div className="category-item">
            <span className="category-emoji">🍽️</span>
            <h4>Food</h4>
            <p>Calculate the carbon impact of your dietary choices.</p>
          </div>

          <div className="category-item">
            <span className="category-emoji">🗑️</span>
            <h4>Waste</h4>
            <p>Track your waste generation and recycling efforts.</p>
          </div>

          <div className="category-item">
            <span className="category-emoji">🛍️</span>
            <h4>Shopping</h4>
            <p>Understand the carbon footprint of your purchases.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Make a Change?</h2>
        <p>Start tracking your carbon footprint today and take the first step towards a sustainable lifestyle.</p>
        {!isAuthenticated && (
          <Link to="/register" className="btn btn-primary btn-large">
            Create Free Account
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;