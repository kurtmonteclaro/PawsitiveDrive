import React, { createContext, useContext, useEffect, useState } from 'react';

const DonationContext = createContext();

const STORAGE_KEY = 'pawsitiveDriveDonationTotal';

const parseStoredTotal = (storedValue) => {
  const parsed = parseFloat(storedValue);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const DonationProvider = ({ children }) => {
  const [total, setTotal] = useState(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return stored ? parseStoredTotal(stored) : 0;
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, total.toString());
  }, [total]);

  const addDonation = (amount) => {
    setTotal((prev) => {
      const next = parseFloat((prev + amount).toFixed(2));
      return Number.isFinite(next) ? next : prev;
    });
  };

  return (
    <DonationContext.Provider value={{ total, addDonation }}>
      {children}
    </DonationContext.Provider>
  );
};

export const useDonation = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
};

