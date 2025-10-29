// client/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homePage}>
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>Track Your Carbon Footprint</h1>
          <p className={styles.heroSubtitle}>
            Take urgent action to combat climate change. Monitor, measure, and 
            reduce your environmental impact aligned with UN SDG 13.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/register" className={styles.primaryButton}>
              Get Started Free
            </Link>
            <Link to="/login" className={styles.secondaryButton}>
              Log In
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Track Your Carbon Footprint?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌍</div>
              <h3 className={styles.featureTitle}>SDG 13 Alignment</h3>
              <p className={styles.featureDescription}>
                Contribute to Climate Action goals by understanding and reducing 
                your personal emissions.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Real-Time Tracking</h3>
              <p className={styles.featureDescription}>
                Monitor your transportation, electricity, food, and waste emissions 
                with live updates.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💡</div>
              <h3 className={styles.featureTitle}>Actionable Insights</h3>
              <p className={styles.featureDescription}>
                Get personalized recommendations to reduce your carbon footprint 
                and make a positive impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sdgSection}>
        <div className={styles.container}>
          <div className={styles.sdgContent}>
            <h2 className={styles.sectionTitle}>About UN SDG 13: Climate Action</h2>
            <p className={styles.sdgText}>
              The United Nations' Sustainable Development Goal 13 calls for urgent 
              action to combat climate change and its impacts. This includes 
              strengthening resilience, integrating climate measures into policies, 
              and improving education about climate change mitigation.
            </p>
            <div className={styles.sdgQuote}>
              <p className={styles.sdgQuoteText}>
                "The global temperature has already risen 1.1°C above pre-industrial 
                levels. To limit warming to 1.5°C, global emissions must peak before 
                2025 and decline 43% by 2030."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Start Your Climate Action Journey Today</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of users taking control of their carbon footprint
          </p>
          <Link to="/register" className={styles.ctaButton}>
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
