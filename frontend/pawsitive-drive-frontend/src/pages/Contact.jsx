import React, { useState } from 'react';

// Tailwind CSS classes are assumed to be available
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

        // In a real application, you would send this data to a backend API endpoint.
        // Example: await axios.post('/api/contact', formData);
        
        // Simulating a network request delay
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        setLoading(false);
        // Simulate success response
        setStatus('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Clear status message after 5 seconds
        setTimeout(() => setStatus(''), 5000);
    };

    // Card component for displaying contact information
    const InfoCard = ({ icon, title, children }) => (
        <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-lg transition-all hover:shadow-xl border border-gray-100">
            <div className="text-3xl mb-3 p-3 bg-indigo-100 text-indigo-600 rounded-full">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
            <div className="text-gray-600 text-sm leading-relaxed space-y-1">
                {children}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Page Header */}
            <header className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
                    Contact Us
                </h1>
                <p className="text-lg text-gray-500">
                    We'd love to hear from you. Get in touch with our team about adoption, volunteering, or donations.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Contact Information Cards (Left Column) */}
                <div className="lg:col-span-1 space-y-6">
                    <InfoCard icon="📧" title="Email">
                        <a href="mailto:hello@pawsitivedrive.org" className="text-indigo-600 hover:text-indigo-800 font-medium">
                            hello@pawsitivedrive.org
                        </a>
                        <a href="mailto:info@pawsitivedrive.org" className="text-indigo-600 hover:text-indigo-800 font-medium">
                            info@pawsitivedrive.org
                        </a>
                    </InfoCard>

                    <InfoCard icon="📞" title="Phone">
                        <a href="tel:+1234567890" className="text-indigo-600 hover:text-indigo-800 text-lg font-bold">
                            +1 (234) 567-8900
                        </a>
                        <p className="text-xs text-gray-400 mt-1">Monday - Friday, 9:00 AM - 6:00 PM</p>
                    </InfoCard>

                    <InfoCard icon="📍" title="Shelter Address">
                        <p>
                            123 Animal Care Avenue, Suite 400<br />
                            Pet City, PC 12345<br />
                            Philippines
                        </p>
                    </InfoCard>

                    <InfoCard icon="🕒" title="Shelter Hours">
                        <p className="flex justify-between w-full"><strong>Mon - Fri:</strong> <span>9:00 AM - 6:00 PM</span></p>
                        <p className="flex justify-between w-full"><strong>Saturday:</strong> <span>10:00 AM - 4:00 PM</span></p>
                        <p className="flex justify-between w-full text-red-500"><strong>Sunday:</strong> <span>Closed</span></p>
                    </InfoCard>
                </div>

                {/* Contact Form (Right Column) */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-indigo-100">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Send Us a Message</h2>
                        <p className="text-gray-500 mb-6">
                            Fill out the form below and we'll respond as soon as possible.
                        </p>

                        {status && (
                            <div className={`p-4 mb-4 rounded-lg font-medium ${status.includes('Thank you') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span>{status.includes('Thank you') ? '✅' : '❌'}</span> {status}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="flex flex-col">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
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
                                {/* Email */}
                                <div className="flex flex-col">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Your Email <span className="text-red-500">*</span></label>
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
                            </div>

                            {/* Subject */}
                            <div className="flex flex-col">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
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

                            {/* Message */}
                            <div className="flex flex-col">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
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

                            <button type="submit" className="btn primary w-full text-lg" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;