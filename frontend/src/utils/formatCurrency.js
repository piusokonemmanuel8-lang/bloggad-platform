export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  const amount = Number(value || 0);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default formatCurrency;