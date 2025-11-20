import React, { useState } from 'react';
import "../App.css";


const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setStatus('Thank you for your message! We will get back to you soon.');

        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });

        setTimeout(() => setStatus(''), 5000);
    };

    const InfoCard = ({ icon, title, children }) => (
        <div className="contact-card fade-in">
            <div className="contact-card-icon">{icon}</div>
            <h3 className="contact-card-title">{title}</h3>
            <div className="contact-card-text">{children}</div>
        </div>
    );

    return (
        <div className="contact-container">
            <header className="contact-header fade-in">
                <h1>Contact Us</h1>
                <p>We’d love to hear from you. Reach out anytime for adoption, volunteering, or donations.</p>
            </header>

            <div className="contact-content">
                {/* LEFT SIDE – INFO CARDS */}
                <div className="contact-info-section">
                    <InfoCard icon="📧" title="Email">
                        <p>hello@pawsitivedrive.org</p>
                        <p>info@pawsitivedrive.org</p>
                    </InfoCard>

                    <InfoCard icon="📞" title="Phone">
                        <p className="primary-text">+1 (234) 567-8900</p>
                        <small>Mon - Fri, 9:00 AM - 6:00 PM</small>
                    </InfoCard>

                    <InfoCard icon="📍" title="Shelter Address">
                        <p>123 Animal Care Avenue<br />Pet City, PC 12345<br />Philippines</p>
                    </InfoCard>

                    <InfoCard icon="🕒" title="Shelter Hours">
                        <p><strong>Mon - Fri:</strong> 9 AM – 6 PM</p>
                        <p><strong>Saturday:</strong> 10 AM – 4 PM</p>
                        <p className="closed"><strong>Sunday:</strong> Closed</p>
                    </InfoCard>
                </div>

                {/* RIGHT SIDE – FORM */}
                <div className="contact-form-section fade-in">
                    <div className="contact-form-card">
                        <h2>Send Us a Message</h2>
                        <p>Fill out the form and we’ll get back to you shortly.</p>

                        {status && (
                            <div className={`contact-status ${status.includes("Thank you") ? "success" : "error"}`}>
                                {status}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Your Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Your Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Subject *</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    name="message"
                                    rows="6"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
