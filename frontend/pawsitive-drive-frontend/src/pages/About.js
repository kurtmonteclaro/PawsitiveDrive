import React from 'react';

export default function About() {
  return (
    <div>
      <div className="page-header">
        <h1>About Pawsitive Drive</h1>
        <p className="lead">Every paw deserves love, care, and a chance to live happily.</p>
      </div>

      <section className="about-hero">
        <div className="about-hero-content">
          <h2>Our Story</h2>
          <p>
            Pawsitive Drive was born from a simple belief: every animal deserves a loving home and a chance at happiness. 
            We are a group of passionate animal lovers and advocates who share the same commitment to kindness and compassion. 
            What started as a small initiative has grown into a dedicated platform connecting caring individuals with pets in need.
          </p>
        </div>
      </section>

      <section className="about-mission">
        <div className="mission-card">
          <div className="mission-icon">🎯</div>
          <h2>Our Mission</h2>
          <p>
            To go beyond temporary relief and create a lasting impact in the lives of stray animals. 
            We strive to provide every pet with the opportunity to find a forever home where they can thrive, 
            while also supporting the community through education and awareness about responsible pet ownership.
          </p>
        </div>
      </section>

      <section className="about-gallery">
        <h2 className="section-title">Our Shelter</h2>
        <p className="section-subtitle">A safe haven where every pet is cared for with love and dedication</p>
        
        <div className="gallery-grid">
          <div className="gallery-item">
            <img 
              src="/images/shelter-dogs-1.jpg" 
              alt="Dogs in shelter enclosure" 
              className="gallery-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800&h=600&fit=crop';
              }}
            />
            <div className="gallery-overlay">
              <p>Our dedicated team ensures every pet receives individual attention and care</p>
            </div>
          </div>

          <div className="gallery-item">
            <img 
              src="/images/shelter-outdoor-1.jpg" 
              alt="Outdoor shelter area with dogs" 
              className="gallery-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop';
              }}
            />
            <div className="gallery-overlay">
              <p>Spacious outdoor areas where pets can play and socialize</p>
            </div>
          </div>

          <div className="gallery-item">
            <img 
              src="/images/shelter-interaction-1.jpg" 
              alt="Staff interacting with dogs" 
              className="gallery-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop';
              }}
            />
            <div className="gallery-overlay">
              <p>Building trust and bonds through daily interaction and care</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <h2 className="section-title">Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">❤️</div>
            <h3>Compassion</h3>
            <p>We treat every animal with the respect and kindness they deserve, recognizing their unique personalities and needs.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3>Community</h3>
            <p>We believe in the power of community to create positive change and bring people together for a common cause.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🌟</div>
            <h3>Excellence</h3>
            <p>We maintain high standards in animal care, ensuring the best possible outcomes for every pet in our program.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🔒</div>
            <h3>Transparency</h3>
            <p>We operate with honesty and openness, keeping our supporters informed about how their contributions make a difference.</p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="cta-card">
          <h2>Join Our Mission</h2>
          <p>Whether you're looking to adopt, donate, or volunteer, there's a place for you in the Pawsitive Drive family.</p>
          <div className="cta-buttons">
            <a href="/adopt" className="btn accent">Browse Pets</a>
            <a href="/donate" className="btn primary">Make a Donation</a>
          </div>
        </div>
      </section>
    </div>
  );
}
