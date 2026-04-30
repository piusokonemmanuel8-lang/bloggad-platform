const express = require('express')
const { protect } = require('../../middleware/authMiddleware')

const {
  refreshLeaderboard,
  getLeaderboard,
  getMyLeaderboardRank,
} = require('../../controllers/affiliate/affiliateLeaderboardController')

const router = express.Router()

router.get('/', protect, getLeaderboard)
router.get('/me', protect, getMyLeaderboardRank)
router.post('/refresh', protect, refreshLeaderboard)

module.exports = router