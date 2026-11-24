import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', label: 'Dollar ($)' },
  INR: { code: 'INR', symbol: '₹', label: 'Rupee (₹)' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('spendly:currency') || 'USD';
  });

  const setCurrency = (curr) => {
    setCurrencyState(curr);
    localStorage.setItem('spendly:currency', curr);
  };

  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  const formatAmount = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return `${currencySymbol}${num.toFixed(2)}`;
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'INR' : 'USD');
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        currencySymbol,
        formatAmount,
        CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export function CurrencySelector({ className = '' }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-xs ${className}`}
      role="group"
      aria-label="Currency selection"
    >
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
          currency === 'USD'
            ? 'bg-background text-foreground shadow-xs font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        $ USD
      </button>
      <button
        type="button"
        onClick={() => setCurrency('INR')}
        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
          currency === 'INR'
            ? 'bg-background text-foreground shadow-xs font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        ₹ INR
      </button>
    </div>
  );
}
