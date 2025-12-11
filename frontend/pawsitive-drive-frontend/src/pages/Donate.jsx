import React from 'react';
import DonationForm from '../components/DonationForm';
import { useDonation } from '../context/DonationContext';
import './Donate.css';

const formatPesoNumber = (value) => {
  return value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function Donate() {
  const { total } = useDonation();

  return (
    <div className="container">
      <div className="page-header text-center mb-8">
        <h2 className="section-title">Make a Donation</h2>
        <p className="section-subtitle">
          Your contribution helps us care for pets and find them loving homes
        </p>
      </div>

      {/* Prominent Total Display */}
      <div className="donation-total-display">
        <div className="donation-total-content">
          <div className="donation-total-label">Total Donations Raised</div>
          <div className="donation-total-amount">₱{formatPesoNumber(total)}</div>
          <div className="donation-total-subtitle">Supporting pets in need</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <DonationForm />

        <div className="donation-info-card">
          <h3 className="donation-info-title">Your Impact</h3>
          <p className="donation-info-text">
            Every donation makes a difference in the lives of our furry friends. Your generosity helps us provide:
          </p>
          <ul className="donation-impact-list">
            <li className="donation-impact-item">
              <span className="impact-number">1.</span>
              Medical care and vaccinations for rescued pets
            </li>
            <li className="donation-impact-item">
              <span className="impact-number">2.</span>
              Food, shelter, and daily care for animals awaiting adoption
            </li>
            <li className="donation-impact-item">
              <span className="impact-number">3.</span>
              Spay and neuter programs to control pet population
            </li>
            <li className="donation-impact-item">
              <span className="impact-number">4.</span>
              Adoption services and matching pets with loving families
            </li>
          </ul>

          <div className="donation-info-highlight">
            <strong>Thank you</strong> for being part of our mission to give every pet a chance at a happy life.
          </div>

          <div className="donation-info-cta">
            <a href="/adopt" className="btn accent">
              Browse Available Pets
            </a>
          </div>
        </div>

        <div className="donation-info-card">
          <h3 className="donation-info-title">Ways to Help</h3>
          <p className="donation-info-text">
            There are many ways you can make a difference in the lives of pets in need:
          </p>
          <ul className="donation-impact-list">
            <li className="donation-impact-item">
              <span className="impact-number">1.</span>
              Make a one-time or recurring donation
            </li>
            <li className="donation-impact-item">
              <span className="impact-number">2.</span>
              Sponsor a specific pet's care and medical needs
            </li>
            <li className="donation-impact-item">
              <span className="impact-number">3.</span>
              Volunteer your time at our shelter
            </li>
            <li className="donation-impact-item">
              <span className="impact-number">4.</span>
              Share our mission with friends and family
            </li>
          </ul>

          <div className="donation-info-highlight">
            <strong>Every contribution</strong> helps us save more lives and find loving homes for pets.
          </div>

          <div className="donation-info-cta">
            <a href="/contact" className="btn primary">
              Get Involved
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}