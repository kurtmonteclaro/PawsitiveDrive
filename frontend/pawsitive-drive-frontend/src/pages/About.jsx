import React from 'react';

export default function About() {
  return (
    <div className="about-page-wrapper">
      <div className="page-header">
        <h1>About Pawsitive Drive 🐾</h1>
        <p className="lead">Every paw deserves love, care, and a chance to live happily.</p>
      </div>

      <section className="about-hero py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h2 className="text-3xl font-extrabold text-indigo-600 mb-4">Our Story</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Pawsitive Drive was born from a simple belief: every animal deserves a loving home and a chance at happiness. 
            We are a group of passionate animal lovers and advocates who share the same commitment to kindness and compassion. 
            What started as a small initiative has grown into a dedicated platform connecting caring individuals with pets in need.
          </p>
        </div>
      </section>

      <section className="about-mission py-16 bg-white">
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-indigo-50 p-8 rounded-xl shadow-2xl text-center border-t-4 border-indigo-600">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              To go beyond temporary relief and create a lasting impact in the lives of stray animals. 
              We strive to provide every pet with the opportunity to find a forever home where they can thrive, 
              while also supporting the community through education and awareness about responsible pet ownership.
            </p>
          </div>
        </div>
      </section>

      <section className="about-gallery py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="section-title text-center text-3xl font-bold text-gray-800 mb-3">Our Shelter</h2>
          <p className="section-subtitle text-center text-gray-600 mb-10">A safe haven where every pet is cared for with love and dedication</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Gallery Item 1 */}
            <div className="relative overflow-hidden rounded-lg shadow-xl group gallery-item">
              <img 
                src="/images/shelter-dogs-1.jpg" 
                alt="Dogs in shelter enclosure" 
                className="w-full h-64 object-cover transition duration-500 transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800&h=600&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition duration-500 gallery-overlay">
                <p className="text-white p-4 text-sm">Our dedicated team ensures every pet receives individual attention and care</p>
              </div>
            </div>

            {/* Gallery Item 2 */}
            <div className="relative overflow-hidden rounded-lg shadow-xl group gallery-item">
              <img 
                src="/images/shelter-outdoor-1.jpg" 
                alt="Outdoor shelter area with dogs" 
                className="w-full h-64 object-cover transition duration-500 transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition duration-500 gallery-overlay">
                <p className="text-white p-4 text-sm">Spacious outdoor areas where pets can play and socialize</p>
              </div>
            </div>

            {/* Gallery Item 3 */}
            <div className="relative overflow-hidden rounded-lg shadow-xl group gallery-item">
              <img 
                src="/images/shelter-interaction-1.jpg" 
                alt="Staff interacting with dogs" 
                className="w-full h-64 object-cover transition duration-500 transform group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end opacity-0 group-hover:opacity-100 transition duration-500 gallery-overlay">
                <p className="text-white p-4 text-sm">Building trust and bonds through daily interaction and care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values py-16 bg-white">
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="section-title text-center text-3xl font-bold text-gray-800 mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 values-grid">
            
            <div className="p-6 bg-yellow-50 rounded-lg shadow-md border-t-4 border-yellow-500 value-card">
              <div className="text-3xl mb-3">❤️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Compassion</h3>
              <p className="text-gray-600 text-sm">We treat every animal with the respect and kindness they deserve, recognizing their unique personalities and needs.</p>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-lg shadow-md border-t-4 border-blue-500 value-card">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600 text-sm">We believe in the power of community to create positive change and bring people together for a common cause.</p>
            </div>
            
            <div className="p-6 bg-green-50 rounded-lg shadow-md border-t-4 border-green-500 value-card">
              <div className="text-3xl mb-3">🌟</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Excellence</h3>
              <p className="text-gray-600 text-sm">We maintain high standards in animal care, ensuring the best possible outcomes for every pet in our program.</p>
            </div>

            <div className="p-6 bg-purple-50 rounded-lg shadow-md border-t-4 border-purple-500 value-card">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Transparency</h3>
              <p className="text-gray-600 text-sm">We operate with honesty and openness, keeping our supporters informed about how their contributions make a difference.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta py-16 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center p-6 cta-card">
          <h2 className="text-4xl font-extrabold text-white mb-4">Join Our Mission</h2>
          <p className="text-xl text-indigo-100 mb-8">Whether you're looking to adopt, donate, or volunteer, there's a place for you in the Pawsitive Drive family.</p>
          <div className="flex justify-center space-x-4 cta-buttons">
            <a href="/adopt" className="btn bg-white text-indigo-600 hover:bg-gray-200 text-lg font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
                Browse Pets
            </a>
            <a href="/donate" className="btn bg-indigo-800 text-white hover:bg-indigo-700 text-lg font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
                Make a Donation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}