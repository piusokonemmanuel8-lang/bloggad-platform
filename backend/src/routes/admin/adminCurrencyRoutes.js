const express = require('express')
const {
  getAdminCurrencies,
  createAdminCurrency,
  updateAdminCurrency,
  deleteAdminCurrency,
  setDefaultAdminCurrency,
  toggleAdminCurrencyStatus,
} = require('../../controllers/admin/adminCurrencyController')

const { protect, adminOnly } = require('../../middleware/authMiddleware')

const router = express.Router()

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Admin currency routes working',
  })
})

router.get('/', protect, adminOnly, getAdminCurrencies)
router.post('/', protect, adminOnly, createAdminCurrency)
router.put('/:id', protect, adminOnly, updateAdminCurrency)
router.delete('/:id', protect, adminOnly, deleteAdminCurrency)

router.patch('/:id/default', protect, adminOnly, setDefaultAdminCurrency)
router.patch('/:id/status', protect, adminOnly, toggleAdminCurrencyStatus)

module.exports = router