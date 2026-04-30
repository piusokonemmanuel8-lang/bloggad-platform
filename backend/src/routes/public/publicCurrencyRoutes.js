const express = require('express')
const {
  getPublicCurrencies,
  getPublicVisitorCurrency,
} = require('../../controllers/public/publicCurrencyController')

const router = express.Router()

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Public currency routes working',
  })
})

router.get('/list', getPublicCurrencies)
router.get('/visitor', getPublicVisitorCurrency)

module.exports = router