import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the form data to a backend
    setStatus('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setStatus(''), 5000);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Get in touch with our team.</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">📧</div>
            <h3>Email</h3>
            <p>
              <a href="mailto:hello@pawsitivedrive.org" className="contact-link">
                hello@pawsitivedrive.org
              </a>
            </p>
            <p>
              <a href="mailto:info@pawsitivedrive.org" className="contact-link">
                info@pawsitivedrive.org
              </a>
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">📞</div>
            <h3>Phone</h3>
            <p>
              <a href="tel:+1234567890" className="contact-link">
                +1 (234) 567-8900
              </a>
            </p>
            <p className="info-note">Monday - Friday, 9:00 AM - 6:00 PM</p>
          </div>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Address</h3>
            <p>
              123 Animal Care Avenue<br />
              Pet City, PC 12345<br />
              Philippines
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">🕒</div>
            <h3>Shelter Hours</h3>
            <p>
              <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM<br />
              <strong>Saturday:</strong> 10:00 AM - 4:00 PM<br />
              <strong>Sunday:</strong> Closed
            </p>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and we'll respond as soon as possible.</p>

            {status && (
              <div className="flash success-flash">
                <span>✓</span> {status}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Your Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="form-input"
                  rows="6"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button type="submit" className="btn primary auth-submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
