import React, { useMemo, useState } from 'react';
import { useDonation } from '../context/DonationContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_ROOT = process.env.REACT_APP_API_BASE ?? 'http://localhost:8080/api';

const formatPeso = (value) =>
  value.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  });

const paymentOptions = [
  { key: 'card', label: 'Credit Card', description: 'Visa, Mastercard, or other major cards' },
  { key: 'paypal', label: 'PayPal', description: 'Secure payment through PayPal' },
];

export default function DonationForm() {
  const { addDonation } = useDonation();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [target, setTarget] = useState('general');
  const [petId, setPetId] = useState('');
  const [step, setStep] = useState('input'); // input | payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const amountNumber = useMemo(() => parseFloat(amount || '0'), [amount]);

  const resetForm = () => {
    setAmount('');
    setTarget('general');
    setPetId('');
    setPaymentMethod('card');
    setStep('input');
  };

  const handlePrimarySubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid donation amount greater than ₱0.00.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handleConfirm = async () => {
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    if (!user) {
      setError('Please log in to make a donation.');
      return;
    }

    setProcessing(true);
    setError('');
    
    try {
      const userId = user.user_id || user.id;
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Prepare donation data
      const donationData = {
        amount: amountNumber,
        payment_method: paymentMethod === 'card' ? 'Credit Card' : 'PayPal',
        status: 'Completed',
        user: {
          user_id: userId
        }
      };

      // If it's a pet-specific donation, try to find the pet
      if (target === 'pet' && petId) {
        try {
          // Try to find pet by ID first
          const petIdNum = parseInt(petId);
          if (!isNaN(petIdNum)) {
            const petRes = await axios.get(`${API_ROOT}/pets/${petIdNum}`);
            if (petRes.data) {
              donationData.pet = {
                pet_id: petRes.data.pet_id || petRes.data.id
              };
            }
          } else {
            // If not a number, try to search by name
            const petsRes = await axios.get(`${API_ROOT}/pets`);
            const pets = Array.isArray(petsRes.data) ? petsRes.data : [];
            const foundPet = pets.find(p => 
              p.name && p.name.toLowerCase().includes(petId.toLowerCase())
            );
            if (foundPet) {
              donationData.pet = {
                pet_id: foundPet.pet_id || foundPet.id
              };
            }
          }
        } catch (petErr) {
          console.warn('Could not find pet, creating general donation:', petErr);
          // Continue without pet - it's optional
        }
      }

      // Save donation to database
      const response = await axios.post(`${API_ROOT}/donations`, donationData);
      
      // Update local donation total
      addDonation(amountNumber);
      
      setMessage(
        `Thank you for your donation of ${formatPeso(amountNumber)}${donationData.pet ? ` for the pet` : ''}!`
      );
      resetForm();
    } catch (err) {
      console.error('Failed to save donation:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to process donation. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="donation-form-container">
      <h3 className="donation-form-title">Make a Donation</h3>
      <p className="donation-form-subtitle">Choose your amount and help make a difference</p>

      <form onSubmit={handlePrimarySubmit} className="donation-form">
        <div className="donation-form-group">
          <label htmlFor="amount" className="donation-form-label">
            Donation amount (₱)
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="donation-form-input"
            required
          />
        </div>

        <div className="donation-form-group">
          <p className="donation-form-label">Choose donation target</p>
          <div className="donation-target-options">
            <button
              type="button"
              onClick={() => setTarget('general')}
              className={`donation-target-btn ${target === 'general' ? 'donation-target-active' : ''}`}
            >
              <span className="donation-target-title">General Fund</span>
              <span className="donation-target-desc">Help all pets equally</span>
            </button>
            <button
              type="button"
              onClick={() => setTarget('pet')}
              className={`donation-target-btn ${target === 'pet' ? 'donation-target-active' : ''}`}
            >
              <span className="donation-target-title">Specific Pet</span>
              <span className="donation-target-desc">Support a specific pet</span>
            </button>
          </div>
          {target === 'pet' && (
            <input
              type="text"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              placeholder="Enter Pet ID or Name"
              className="donation-form-input donation-form-input-pet"
            />
          )}
        </div>

        {step === 'input' && (
          <button type="submit" className="btn primary donation-submit-btn">
            Donate {amount ? formatPeso(amountNumber || 0) : 'Now'}
          </button>
        )}
      </form>

      {step === 'payment' && (
        <div className="donation-payment-section">
          <div className="donation-payment-header">
            <div>
              <p className="donation-payment-step">Step 2: Payment Method</p>
              <p className="donation-payment-amount">{formatPeso(amountNumber || 0)}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep('input')}
              className="donation-payment-edit"
            >
              Edit amount/target
            </button>
          </div>

          <div className="donation-payment-options">
            {paymentOptions.map((option) => (
              <label
                key={option.key}
                className={`donation-payment-option ${paymentMethod === option.key ? 'donation-payment-option-active' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.key}
                  checked={paymentMethod === option.key}
                  onChange={() => setPaymentMethod(option.key)}
                  className="donation-payment-radio"
                />
                <div>
                  <p className="donation-payment-label">{option.label}</p>
                  <p className="donation-payment-desc">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="btn primary donation-confirm-btn"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Confirm Donation'}
          </button>
        </div>
      )}

      {error && (
        <div className="donation-message donation-message-error">
          {error}
        </div>
      )}

      {message && (
        <div className="donation-message donation-message-success">
          {message}
        </div>
      )}
    </div>
  );
}

