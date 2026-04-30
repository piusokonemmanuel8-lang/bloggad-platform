const db = require('../../config/db')

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']

  if (forwarded) {
    return String(forwarded).split(',')[0].trim()
  }

  return (
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    ''
  )
}

const normalizeCountryCode = (value) => {
  if (!value) return ''
  return String(value).trim().toUpperCase()
}

const getCountryFromRequest = (req) => {
  return normalizeCountryCode(
    req.headers['cf-ipcountry'] ||
      req.headers['x-vercel-ip-country'] ||
      req.headers['x-country-code'] ||
      req.query.country
  )
}

const getDefaultCurrency = async () => {
  const [rows] = await db.query(`
    SELECT
      id,
      country_name,
      country_code,
      currency_code,
      currency_name,
      currency_symbol,
      exchange_rate,
      is_active,
      is_default
    FROM currencies
    WHERE is_default = 1
    LIMIT 1
  `)

  if (rows.length) return rows[0]

  const [fallbackRows] = await db.query(`
    SELECT
      id,
      country_name,
      country_code,
      currency_code,
      currency_name,
      currency_symbol,
      exchange_rate,
      is_active,
      is_default
    FROM currencies
    WHERE is_active = 1
    ORDER BY id ASC
    LIMIT 1
  `)

  return fallbackRows[0] || null
}

const getPublicCurrencies = async (req, res) => {
  try {
    const [currencies] = await db.query(`
      SELECT
        id,
        country_name,
        country_code,
        currency_code,
        currency_name,
        currency_symbol,
        exchange_rate,
        is_active,
        is_default
      FROM currencies
      WHERE is_active = 1
      ORDER BY is_default DESC, country_name ASC
    `)

    return res.status(200).json({
      ok: true,
      currencies,
    })
  } catch (error) {
    console.error('getPublicCurrencies error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to load currencies.',
    })
  }
}

const getPublicVisitorCurrency = async (req, res) => {
  try {
    const ip = getClientIp(req)
    const countryCode = getCountryFromRequest(req)

    let currency = null

    if (countryCode) {
      const [rows] = await db.query(
        `
          SELECT
            id,
            country_name,
            country_code,
            currency_code,
            currency_name,
            currency_symbol,
            exchange_rate,
            is_active,
            is_default
          FROM currencies
          WHERE country_code = ?
          AND is_active = 1
          LIMIT 1
        `,
        [countryCode]
      )

      currency = rows[0] || null
    }

    if (!currency) {
      currency = await getDefaultCurrency()
    }

    if (!currency) {
      return res.status(404).json({
        ok: false,
        message: 'No active currency found.',
      })
    }

    return res.status(200).json({
      ok: true,
      ip,
      detected_country_code: countryCode || null,
      currency,
    })
  } catch (error) {
    console.error('getPublicVisitorCurrency error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to detect visitor currency.',
    })
  }
}

module.exports = {
  getPublicCurrencies,
  getPublicVisitorCurrency,
  getDefaultCurrency,
}