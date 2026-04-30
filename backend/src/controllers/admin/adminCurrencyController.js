const db = require('../../config/db')

const normalizeText = (value) => {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

const normalizeUpper = (value) => {
  return normalizeText(value).toUpperCase()
}

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const getAdminCurrencies = async (req, res) => {
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
        is_default,
        created_at,
        updated_at
      FROM currencies
      ORDER BY is_default DESC, country_name ASC
    `)

    return res.status(200).json({
      ok: true,
      currencies,
    })
  } catch (error) {
    console.error('getAdminCurrencies error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to load currencies.',
    })
  }
}

const createAdminCurrency = async (req, res) => {
  try {
    const countryName = normalizeText(req.body.country_name)
    const countryCode = normalizeUpper(req.body.country_code)
    const currencyCode = normalizeUpper(req.body.currency_code)
    const currencyName = normalizeText(req.body.currency_name)
    const currencySymbol = normalizeText(req.body.currency_symbol)
    const exchangeRate = toNumber(req.body.exchange_rate, 0)
    const isActive = req.body.is_active === false || req.body.is_active === 0 || req.body.is_active === '0' ? 0 : 1
    const isDefault = req.body.is_default === true || req.body.is_default === 1 || req.body.is_default === '1' ? 1 : 0

    if (!countryName || !countryCode || !currencyCode || !currencyName || !currencySymbol) {
      return res.status(400).json({
        ok: false,
        message: 'Country name, country code, currency code, currency name, and symbol are required.',
      })
    }

    if (exchangeRate <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Exchange rate must be greater than 0.',
      })
    }

    const [existing] = await db.query(
      `
        SELECT id
        FROM currencies
        WHERE country_code = ?
        LIMIT 1
      `,
      [countryCode]
    )

    if (existing.length) {
      return res.status(409).json({
        ok: false,
        message: 'A currency already exists for this country code.',
      })
    }

    if (isDefault) {
      await db.query(`UPDATE currencies SET is_default = 0`)
    }

    const [result] = await db.query(
      `
        INSERT INTO currencies (
          country_name,
          country_code,
          currency_code,
          currency_name,
          currency_symbol,
          exchange_rate,
          is_active,
          is_default
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        countryName,
        countryCode,
        currencyCode,
        currencyName,
        currencySymbol,
        exchangeRate,
        isActive,
        isDefault,
      ]
    )

    const [created] = await db.query(
      `
        SELECT *
        FROM currencies
        WHERE id = ?
        LIMIT 1
      `,
      [result.insertId]
    )

    return res.status(201).json({
      ok: true,
      message: 'Currency created successfully.',
      currency: created[0],
    })
  } catch (error) {
    console.error('createAdminCurrency error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to create currency.',
    })
  }
}

const updateAdminCurrency = async (req, res) => {
  try {
    const currencyId = Number(req.params.id)

    if (!currencyId) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid currency ID.',
      })
    }

    const countryName = normalizeText(req.body.country_name)
    const countryCode = normalizeUpper(req.body.country_code)
    const currencyCode = normalizeUpper(req.body.currency_code)
    const currencyName = normalizeText(req.body.currency_name)
    const currencySymbol = normalizeText(req.body.currency_symbol)
    const exchangeRate = toNumber(req.body.exchange_rate, 0)
    const isActive = req.body.is_active === false || req.body.is_active === 0 || req.body.is_active === '0' ? 0 : 1
    const isDefault = req.body.is_default === true || req.body.is_default === 1 || req.body.is_default === '1' ? 1 : 0

    if (!countryName || !countryCode || !currencyCode || !currencyName || !currencySymbol) {
      return res.status(400).json({
        ok: false,
        message: 'Country name, country code, currency code, currency name, and symbol are required.',
      })
    }

    if (exchangeRate <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Exchange rate must be greater than 0.',
      })
    }

    const [currencyRows] = await db.query(
      `
        SELECT id
        FROM currencies
        WHERE id = ?
        LIMIT 1
      `,
      [currencyId]
    )

    if (!currencyRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Currency not found.',
      })
    }

    const [duplicateRows] = await db.query(
      `
        SELECT id
        FROM currencies
        WHERE country_code = ?
        AND id != ?
        LIMIT 1
      `,
      [countryCode, currencyId]
    )

    if (duplicateRows.length) {
      return res.status(409).json({
        ok: false,
        message: 'Another currency already uses this country code.',
      })
    }

    if (isDefault) {
      await db.query(`UPDATE currencies SET is_default = 0`)
    }

    await db.query(
      `
        UPDATE currencies
        SET
          country_name = ?,
          country_code = ?,
          currency_code = ?,
          currency_name = ?,
          currency_symbol = ?,
          exchange_rate = ?,
          is_active = ?,
          is_default = ?
        WHERE id = ?
      `,
      [
        countryName,
        countryCode,
        currencyCode,
        currencyName,
        currencySymbol,
        exchangeRate,
        isActive,
        isDefault,
        currencyId,
      ]
    )

    const [updated] = await db.query(
      `
        SELECT *
        FROM currencies
        WHERE id = ?
        LIMIT 1
      `,
      [currencyId]
    )

    return res.status(200).json({
      ok: true,
      message: 'Currency updated successfully.',
      currency: updated[0],
    })
  } catch (error) {
    console.error('updateAdminCurrency error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to update currency.',
    })
  }
}

const deleteAdminCurrency = async (req, res) => {
  try {
    const currencyId = Number(req.params.id)

    if (!currencyId) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid currency ID.',
      })
    }

    const [currencyRows] = await db.query(
      `
        SELECT id, is_default
        FROM currencies
        WHERE id = ?
        LIMIT 1
      `,
      [currencyId]
    )

    if (!currencyRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Currency not found.',
      })
    }

    if (Number(currencyRows[0].is_default) === 1) {
      return res.status(400).json({
        ok: false,
        message: 'Default currency cannot be deleted.',
      })
    }

    await db.query(
      `
        DELETE FROM currencies
        WHERE id = ?
      `,
      [currencyId]
    )

    return res.status(200).json({
      ok: true,
      message: 'Currency deleted successfully.',
    })
  } catch (error) {
    console.error('deleteAdminCurrency error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete currency.',
    })
  }
}

const setDefaultAdminCurrency = async (req, res) => {
  try {
    const currencyId = Number(req.params.id)

    if (!currencyId) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid currency ID.',
      })
    }

    const [currencyRows] = await db.query(
      `
        SELECT id
        FROM currencies
        WHERE id = ?
        LIMIT 1
      `,
      [currencyId]
    )

    if (!currencyRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Currency not found.',
      })
    }

    await db.query(`UPDATE currencies SET is_default = 0`)

    await db.query(
      `
        UPDATE currencies
        SET is_default = 1, is_active = 1
        WHERE id = ?
      `,
      [currencyId]
    )

    return res.status(200).json({
      ok: true,
      message: 'Default currency updated successfully.',
    })
  } catch (error) {
    console.error('setDefaultAdminCurrency error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to set default currency.',
    })
  }
}

const toggleAdminCurrencyStatus = async (req, res) => {
  try {
    const currencyId = Number(req.params.id)

    if (!currencyId) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid currency ID.',
      })
    }

    const [currencyRows] = await db.query(
      `
        SELECT id, is_active, is_default
        FROM currencies
        WHERE id = ?
        LIMIT 1
      `,
      [currencyId]
    )

    if (!currencyRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Currency not found.',
      })
    }

    if (Number(currencyRows[0].is_default) === 1) {
      return res.status(400).json({
        ok: false,
        message: 'Default currency cannot be disabled.',
      })
    }

    const nextStatus = Number(currencyRows[0].is_active) === 1 ? 0 : 1

    await db.query(
      `
        UPDATE currencies
        SET is_active = ?
        WHERE id = ?
      `,
      [nextStatus, currencyId]
    )

    return res.status(200).json({
      ok: true,
      message: nextStatus ? 'Currency enabled successfully.' : 'Currency disabled successfully.',
      is_active: nextStatus,
    })
  } catch (error) {
    console.error('toggleAdminCurrencyStatus error:', error)

    return res.status(500).json({
      ok: false,
      message: 'Failed to update currency status.',
    })
  }
}

module.exports = {
  getAdminCurrencies,
  createAdminCurrency,
  updateAdminCurrency,
  deleteAdminCurrency,
  setDefaultAdminCurrency,
  toggleAdminCurrencyStatus,
}