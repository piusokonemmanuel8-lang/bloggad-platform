import { useEffect, useMemo, useState } from 'react';
import {
  createAdminCurrency,
  deleteAdminCurrency,
  getAdminCurrencies,
  setDefaultAdminCurrency,
  toggleAdminCurrencyStatus,
  updateAdminCurrency,
} from '../../services/adminCurrencyService';
import './AdminCurrenciesPage.css';

const emptyForm = {
  country_name: '',
  country_code: '',
  currency_code: '',
  currency_name: '',
  currency_symbol: '',
  exchange_rate: '',
  is_active: 1,
  is_default: 0,
};

export default function AdminCurrenciesPage() {
  const [currencies, setCurrencies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCurrencies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return currencies;

    return currencies.filter((currency) => {
      return (
        String(currency.country_name || '').toLowerCase().includes(query) ||
        String(currency.country_code || '').toLowerCase().includes(query) ||
        String(currency.currency_code || '').toLowerCase().includes(query) ||
        String(currency.currency_name || '').toLowerCase().includes(query)
      );
    });
  }, [currencies, searchTerm]);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getAdminCurrencies();
      setCurrencies(Array.isArray(data?.currencies) ? data.currencies : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load currencies.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage('');
    setError('');
  };

  const handleEdit = (currency) => {
    setEditingId(currency.id);
    setForm({
      country_name: currency.country_name || '',
      country_code: currency.country_code || '',
      currency_code: currency.currency_code || '',
      currency_name: currency.currency_name || '',
      currency_symbol: currency.currency_symbol || '',
      exchange_rate: currency.exchange_rate || '',
      is_active: Number(currency.is_active) === 1 ? 1 : 0,
      is_default: Number(currency.is_default) === 1 ? 1 : 0,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const payload = {
        ...form,
        country_code: String(form.country_code || '').trim().toUpperCase(),
        currency_code: String(form.currency_code || '').trim().toUpperCase(),
        exchange_rate: Number(form.exchange_rate || 0),
        is_active: Number(form.is_active) === 1 ? 1 : 0,
        is_default: Number(form.is_default) === 1 ? 1 : 0,
      };

      if (editingId) {
        const data = await updateAdminCurrency(editingId, payload);
        setMessage(data?.message || 'Currency updated successfully.');
      } else {
        const data = await createAdminCurrency(payload);
        setMessage(data?.message || 'Currency created successfully.');
      }

      resetForm();
      await loadCurrencies();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save currency.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (currency) => {
    const confirmed = window.confirm(`Delete ${currency.currency_code} for ${currency.country_name}?`);
    if (!confirmed) return;

    try {
      setMessage('');
      setError('');

      const data = await deleteAdminCurrency(currency.id);
      setMessage(data?.message || 'Currency deleted successfully.');
      await loadCurrencies();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete currency.');
    }
  };

  const handleSetDefault = async (currency) => {
    try {
      setMessage('');
      setError('');

      const data = await setDefaultAdminCurrency(currency.id);
      setMessage(data?.message || 'Default currency updated successfully.');
      await loadCurrencies();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update default currency.');
    }
  };

  const handleToggleStatus = async (currency) => {
    try {
      setMessage('');
      setError('');

      const data = await toggleAdminCurrencyStatus(currency.id);
      setMessage(data?.message || 'Currency status updated successfully.');
      await loadCurrencies();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update currency status.');
    }
  };

  return (
    <div className="admin-currency-page">
      <div className="admin-currency-hero">
        <div>
          <p>Platform Settings</p>
          <h1>Currency Manager</h1>
          <span>
            Add country currencies, update exchange rates, set default currency, and control customer local pricing.
          </span>
        </div>

        <div className="admin-currency-summary-card">
          <strong>{currencies.length}</strong>
          <span>Total currencies</span>
        </div>
      </div>

      {message ? <div className="admin-currency-alert success">{message}</div> : null}
      {error ? <div className="admin-currency-alert error">{error}</div> : null}

      <div className="admin-currency-grid">
        <form onSubmit={handleSubmit} className="admin-currency-form-card">
          <div className="admin-currency-card-head">
            <h2>{editingId ? 'Edit Currency' : 'Add New Currency'}</h2>
            {editingId ? (
              <button type="button" onClick={resetForm} className="admin-currency-light-btn">
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div className="admin-currency-form-grid">
            <label>
              <span>Country Name</span>
              <input
                type="text"
                name="country_name"
                value={form.country_name}
                onChange={handleChange}
                placeholder="Nigeria"
                required
              />
            </label>

            <label>
              <span>Country Code</span>
              <input
                type="text"
                name="country_code"
                value={form.country_code}
                onChange={handleChange}
                placeholder="NG"
                maxLength={10}
                required
              />
            </label>

            <label>
              <span>Currency Code</span>
              <input
                type="text"
                name="currency_code"
                value={form.currency_code}
                onChange={handleChange}
                placeholder="NGN"
                maxLength={10}
                required
              />
            </label>

            <label>
              <span>Currency Name</span>
              <input
                type="text"
                name="currency_name"
                value={form.currency_name}
                onChange={handleChange}
                placeholder="Nigerian Naira"
                required
              />
            </label>

            <label>
              <span>Currency Symbol</span>
              <input
                type="text"
                name="currency_symbol"
                value={form.currency_symbol}
                onChange={handleChange}
                placeholder="₦"
                required
              />
            </label>

            <label>
              <span>Exchange Rate</span>
              <input
                type="number"
                name="exchange_rate"
                value={form.exchange_rate}
                onChange={handleChange}
                placeholder="1500"
                step="0.000001"
                min="0.000001"
                required
              />
            </label>
          </div>

          <div className="admin-currency-check-row">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={Number(form.is_active) === 1}
                onChange={handleChange}
              />
              <span>Active</span>
            </label>

            <label>
              <input
                type="checkbox"
                name="is_default"
                checked={Number(form.is_default) === 1}
                onChange={handleChange}
              />
              <span>Set as default currency</span>
            </label>
          </div>

          <button type="submit" disabled={saving} className="admin-currency-save-btn">
            {saving ? 'Saving...' : editingId ? 'Update Currency' : 'Add Currency'}
          </button>
        </form>

        <div className="admin-currency-list-card">
          <div className="admin-currency-card-head">
            <h2>All Currencies</h2>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search currency..."
              className="admin-currency-search"
            />
          </div>

          {loading ? (
            <div className="admin-currency-empty">Loading currencies...</div>
          ) : filteredCurrencies.length ? (
            <div className="admin-currency-table-wrap">
              <table className="admin-currency-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Currency</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th>Default</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCurrencies.map((currency) => (
                    <tr key={currency.id}>
                      <td>
                        <strong>{currency.country_name}</strong>
                        <span>{currency.country_code}</span>
                      </td>

                      <td>
                        <strong>
                          {currency.currency_symbol} {currency.currency_code}
                        </strong>
                        <span>{currency.currency_name}</span>
                      </td>

                      <td>{Number(currency.exchange_rate || 0).toLocaleString()}</td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(currency)}
                          className={Number(currency.is_active) === 1 ? 'status-pill active' : 'status-pill inactive'}
                        >
                          {Number(currency.is_active) === 1 ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td>
                        {Number(currency.is_default) === 1 ? (
                          <span className="default-pill">Default</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(currency)}
                            className="make-default-btn"
                          >
                            Make Default
                          </button>
                        )}
                      </td>

                      <td>
                        <div className="admin-currency-actions">
                          <button type="button" onClick={() => handleEdit(currency)}>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(currency)}
                            disabled={Number(currency.is_default) === 1}
                            className="danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-currency-empty">No currencies found.</div>
          )}
        </div>
      </div>
    </div>
  );
}