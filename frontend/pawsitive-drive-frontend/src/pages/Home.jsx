import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load featured pets
  useEffect(() => {
    axios
      .get("/api/pets?status=Available")
      .then((res) => {
        console.log("Pets loaded successfully", res.data);
        setFeaturedPets(res.data.slice(0, 3));
      })
      .catch((err) => {
        console.error("Error loading pets:", err);
        setError("Failed to load featured pets.");
        setFeaturedPets([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Scroll reveal + navbar darken
  useEffect(() => {
    // Scroll reveal
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach((el) => observer.observe(el));

    // Navbar darken on scroll
    const header = document.querySelector(".site-header");
    const onScroll = () => {
      if (!header) return;
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="home">
      {/* ================= HERO (FULL-WIDTH PARALLAX) ================= */}
      <section className="hero-parallax">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            Find a Companion.
            <br />
            Change a Life.
          </h1>
          <p className="hero-subtitle">
            Because every animal deserves safety, compassion, and a loving home.
          </p>
          <div className="hero-buttons">
            <Link to="/adopt" className="btn-primary">
              Browse Pets
            </Link>
            <Link to="/donate" className="btn-outline">
              Make a Donation
            </Link>
          </div>
        </div>
        <div className="hero-fade" />
      </section>

      {/* ================= OUR MISSION ================= */}
      <section className="section mission reveal">
        <div className="section-inner">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            Pawsitive Drive exists to rescue, rehabilitate, and rehome animals in need.
            We believe every pet deserves a second chance at a safe and loving home.
          </p>
        </div>
      </section>

      {/* ================= FEATURED PETS ================= */}
      <section className="section reveal">
        <div className="section-inner">
          <h2 className="section-title">Featured Pets</h2>
          <p className="section-subtitle">
            Meet some of the rescued animals currently waiting for their forever homes.
          </p>

          {loading ? (
            <div className="loading">Loading pets...</div>
          ) : error ? (
            <div className="loading">{error}</div>
          ) : (
            <div className="pets-grid">
              {featuredPets.map((pet, index) => (
                <div
                  key={pet.pet_id}
                  className="pet-card reveal"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="pet-image">
                    {pet.image_url ? (
                      <img src={pet.image_url} alt={pet.name} />
                    ) : (
                      <div className="no-image">No Image Available</div>
                    )}
                  </div>
                  <div className="pet-body">
                    <div className="pet-header">
                      <h3 className="pet-name">{pet.name}</h3>
                      <span className="badge">Available</span>
                    </div>
                    <p className="pet-meta">
                      {pet.breed} • {pet.age} {pet.age === 1 ? "year" : "years"} old
                    </p>
                    <p className="pet-desc">
                      {pet.description ||
                        "This pet is ready to join a loving and compassionate home."}
                    </p>
                    <Link to="/adopt" className="btn-card">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="section-footer">
            <Link to="/adopt" className="btn-dark">
              View All Pets
            </Link>
          </div>
        </div>
      </section>

      {/* ================= WHY ADOPT WITH US ================= */}
      <section className="section features reveal">
        <div className="section-inner">
          <h2 className="section-title">Why Adopt With Pawsitive Drive?</h2>
          <div className="features-grid">
            <div className="feature-box">
              <h3>Ethical & Responsible</h3>
              <p>
                We follow strict adoption guidelines to ensure pets and families are
                matched safely and thoughtfully.
              </p>
            </div>

            <div className="feature-box">
              <h3>Health & Wellness</h3>
              <p>
                Every pet receives medical screening, vaccinations, and proper care before
                being placed for adoption.
              </p>
            </div>

            <div className="feature-box">
              <h3>Lifetime Support</h3>
              <p>
                Our team is here to guide you before, during, and after adoption as your
                pet settles into their new home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUCCESS STORIES ================= */}
      <section className="section success reveal">
        <div className="section-inner">
          <h2 className="section-title">Success Stories</h2>
          <div className="success-grid">
            <div className="story">
              <div className="story-img story1" />
              <h3>Max's New Chapter</h3>
              <p>
                Once abandoned, Max now spends his days playing in the yard with his
                family in Cebu.
              </p>
            </div>
            <div className="story">
              <div className="story-img story2" />
              <h3>Luna Finds Home</h3>
              <p>
                After weeks of recovery, Luna finally found a home that gives her the
                care and comfort she deserves.
              </p>
            </div>
            <div className="story">
              <div className="story-img story3" />
              <h3>Charlie’s Second Chance</h3>
              <p>
                Rescued from the streets, Charlie is now a confident, happy companion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW ADOPTION WORKS ================= */}
      <section className="section timeline reveal">
        <div className="section-inner">
          <h2 className="section-title">How Adoption Works</h2>
          <div className="timeline-steps">
            <div className="step">
              <h3>1. Browse</h3>
              <p>Explore pets and learn their stories, personalities, and needs.</p>
            </div>
            <div className="step">
              <h3>2. Apply</h3>
              <p>Send an application so we can get to know you and your home.</p>
            </div>
            <div className="step">
              <h3>3. Meet</h3>
              <p>Schedule a meet-and-greet and finalize the adoption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GET INVOLVED ================= */}
      <section className="section involved reveal">
        <div className="section-inner">
          <h2 className="section-title">Get Involved</h2>
          <p className="section-subtitle">There are many ways you can help save lives.</p>
          <div className="involved-grid">
            <div className="involved-card">
              <h3>Volunteer</h3>
              <p>Assist with shelter care, events, and community outreach.</p>
            </div>
            <div className="involved-card">
              <h3>Foster</h3>
              <p>Open your home to pets waiting for adoption or recovery.</p>
            </div>
            <div className="involved-card">
              <h3>Sponsor</h3>
              <p>Help fund medical care, food, and supplies for rescued animals.</p>
            </div>
          </div>
        </div>
      </section>

   

      {/* Floating Donate button */}
      <Link to="/donate" className="floating-donate">
        Donate
      </Link>
    </div>
  );
}
