import { useEffect, useState } from 'react'
import {
  fetchVisitorCurrency,
  getLocalizedPrice,
} from '../../utils/currencyHelper'

export default function LocalizedPrice({
  product,
  amount,
  baseCurrencyRate = 1,
  className = '',
  showOriginal = false,
}) {
  const [visitorCurrency, setVisitorCurrency] = useState(null)
  const [priceText, setPriceText] = useState('')

  useEffect(() => {
    loadPrice()

    const handleCurrencyChanged = (event) => {
      const nextCurrency = event.detail
      setVisitorCurrency(nextCurrency)
      buildPrice(nextCurrency)
    }

    window.addEventListener('bloggadCurrencyChanged', handleCurrencyChanged)

    return () => {
      window.removeEventListener('bloggadCurrencyChanged', handleCurrencyChanged)
    }
  }, [product, amount])

  const loadPrice = async () => {
    const result = await fetchVisitorCurrency()
    const currency = result?.currency || null

    setVisitorCurrency(currency)
    buildPrice(currency)
  }

  const buildPrice = (currency) => {
    if (!currency) return

    if (amount !== undefined && amount !== null) {
      const tempProduct = {
        price: amount,
        base_currency_rate: baseCurrencyRate,
      }

      const localized = getLocalizedPrice(tempProduct, currency)
      setPriceText(localized.formatted)
      return
    }

    const localized = getLocalizedPrice(product, currency)
    setPriceText(localized.formatted)
  }

  if (!priceText) {
    return <span className={className}>...</span>
  }

  return (
    <span className={className}>
      {priceText}

      {showOriginal && product?.price ? (
        <small style={{ marginLeft: 6, opacity: 0.65 }}>
          Base: ${Number(product.price || 0).toLocaleString()}
        </small>
      ) : null}
    </span>
  )
}