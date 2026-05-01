const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  '';

const SELECTED_CURRENCY_KEY = 'bloggad_selected_currency';
const VISITOR_CURRENCY_KEY = 'bloggad_visitor_currency';

function getApiUrl(path = '') {
  const cleanBase = String(API_BASE_URL || '').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (!cleanBase) return `/api${cleanPath}`;

  if (cleanBase.endsWith('/api')) return `${cleanBase}${cleanPath}`;

  return `${cleanBase}/api${cleanPath}`;
}

export function getStoredSelectedCurrency() {
  try {
    const stored = localStorage.getItem(SELECTED_CURRENCY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

export function saveSelectedCurrency(currency) {
  try {
    localStorage.setItem(SELECTED_CURRENCY_KEY, JSON.stringify(currency));
  } catch (error) {
    console.error('saveSelectedCurrency error:', error);
  }
}

export function clearSelectedCurrency() {
  try {
    localStorage.removeItem(SELECTED_CURRENCY_KEY);
  } catch (error) {
    console.error('clearSelectedCurrency error:', error);
  }
}

export function getStoredVisitorCurrency() {
  try {
    const stored = localStorage.getItem(VISITOR_CURRENCY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

export function saveVisitorCurrency(currency) {
  try {
    localStorage.setItem(VISITOR_CURRENCY_KEY, JSON.stringify(currency));
  } catch (error) {
    console.error('saveVisitorCurrency error:', error);
  }
}

export async function fetchVisitorCurrency() {
  const selectedCurrency = getStoredSelectedCurrency();

  if (selectedCurrency?.currency_code) {
    return {
      ok: true,
      source: 'manual',
      currency: selectedCurrency,
    };
  }

  try {
    const response = await fetch(getApiUrl('/public/currency/visitor'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.ok || !data?.currency) {
      throw new Error(data?.message || 'Failed to load visitor currency');
    }

    saveVisitorCurrency(data.currency);

    return {
      ok: true,
      source: 'ip',
      currency: data.currency,
    };
  } catch (error) {
    console.error('fetchVisitorCurrency error:', error);

    const fallback = getStoredVisitorCurrency();

    if (fallback?.currency_code) {
      return {
        ok: true,
        source: 'cached',
        currency: fallback,
      };
    }

    return {
      ok: true,
      source: 'fallback',
      currency: {
        country_name: 'United States',
        country_code: 'US',
        currency_code: 'USD',
        currency_name: 'United States Dollar',
        currency_symbol: '$',
        exchange_rate: 1,
      },
    };
  }
}

export async function fetchAvailableCurrencies() {
  try {
    const response = await fetch(getApiUrl('/public/currency/list'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.ok) {
      throw new Error(data?.message || 'Failed to load currencies');
    }

    return data.currencies || [];
  } catch (error) {
    console.error('fetchAvailableCurrencies error:', error);
    return [];
  }
}

export function convertPrice(amount, baseCurrencyRate = 1, visitorCurrencyRate = 1) {
  const numericAmount = Number(amount || 0);
  const baseRate = Number(baseCurrencyRate || 1);
  const targetRate = Number(visitorCurrencyRate || 1);

  if (!Number.isFinite(numericAmount)) return 0;
  if (!baseRate || !targetRate) return numericAmount;

  const amountInUsd = numericAmount / baseRate;
  const convertedAmount = amountInUsd * targetRate;

  return Number(convertedAmount.toFixed(2));
}

export function formatCurrency(amount, currency) {
  const currencyCode = currency?.currency_code || 'USD';
  const symbol = currency?.currency_symbol || '$';
  const numericAmount = Number(amount || 0);

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits:
        currencyCode === 'NGN' || currencyCode === 'KES' ? 0 : 2,
    }).format(numericAmount);
  } catch (error) {
    return `${symbol}${numericAmount.toLocaleString()}`;
  }
}

export function getLocalizedPrice(product, visitorCurrency) {
  const price =
    product?.sale_price ||
    product?.price ||
    product?.product_price ||
    product?.amount ||
    0;

  const baseCurrencyRate =
    product?.base_currency_rate ||
    product?.currency_rate ||
    1;

  const convertedAmount = convertPrice(
    price,
    baseCurrencyRate,
    visitorCurrency?.exchange_rate || 1
  );

  return {
    amount: convertedAmount,
    formatted: formatCurrency(convertedAmount, visitorCurrency),
    currency_code: visitorCurrency?.currency_code || 'USD',
    currency_symbol: visitorCurrency?.currency_symbol || '$',
  };
}