const express = require('express')
const { protect, adminOnly } = require('../../middleware/authMiddleware')

const {
  getAdminLeaderboard,
  refreshAdminLeaderboard,
  saveLeaderboardAdjustment,
  clearLeaderboardAdjustment,
  disqualifyLeaderboardAffiliate,
  restoreLeaderboardAffiliate,
} = require('../../controllers/admin/adminLeaderboardController')

const router = express.Router()

router.get('/', protect, adminOnly, getAdminLeaderboard)

router.post('/refresh', protect, adminOnly, refreshAdminLeaderboard)

router.put('/:affiliateId/adjustment', protect, adminOnly, saveLeaderboardAdjustment)

router.delete('/:affiliateId/adjustment', protect, adminOnly, clearLeaderboardAdjustment)

router.put('/:affiliateId/disqualify', protect, adminOnly, disqualifyLeaderboardAffiliate)

router.put('/:affiliateId/restore', protect, adminOnly, restoreLeaderboardAffiliate)

module.exports = router