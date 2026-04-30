import { useEffect, useState } from 'react'
import {
  fetchAvailableCurrencies,
  fetchVisitorCurrency,
  saveSelectedCurrency,
  clearSelectedCurrency,
} from '../../utils/currencyHelper'

export default function CurrencySwitcher({ onCurrencyChange }) {
  const [currencies, setCurrencies] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCurrencyData()
  }, [])

  const loadCurrencyData = async () => {
    try {
      setLoading(true)

      const [currencyResult, currencyList] = await Promise.all([
        fetchVisitorCurrency(),
        fetchAvailableCurrencies(),
      ])

      const activeCurrency = currencyResult?.currency || null

      setSelectedCurrency(activeCurrency)
      setCurrencies(currencyList || [])

      if (onCurrencyChange) {
        onCurrencyChange(activeCurrency)
      }
    } catch (error) {
      console.error('loadCurrencyData error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCurrencyChange = (event) => {
    const currencyCode = event.target.value

    if (currencyCode === 'AUTO') {
      clearSelectedCurrency()
      loadCurrencyData()
      return
    }

    const currency = currencies.find((item) => item.currency_code === currencyCode)

    if (!currency) return

    saveSelectedCurrency(currency)
    setSelectedCurrency(currency)

    if (onCurrencyChange) {
      onCurrencyChange(currency)
    }

    window.dispatchEvent(
      new CustomEvent('bloggadCurrencyChanged', {
        detail: currency,
      })
    )
  }

  return (
    <div className="bloggad-currency-switcher">
      <label className="bloggad-currency-switcher-label">
        Currency
      </label>

      <select
        className="bloggad-currency-switcher-select"
        value={selectedCurrency?.currency_code || 'AUTO'}
        onChange={handleCurrencyChange}
        disabled={loading}
      >
        <option value="AUTO">Auto</option>

        {currencies.map((currency) => (
          <option key={currency.id} value={currency.currency_code}>
            {currency.currency_symbol} {currency.currency_code}
          </option>
        ))}
      </select>
    </div>
  )
}