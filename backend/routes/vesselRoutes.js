const express = require('express');
const {
  getVessels,
  getVessel,
  createVessel,
  updateVessel,
  deleteVessel,
} = require('../controllers/vesselController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect to all routes
router.use(protect);

// Vessel routes
router.route('/')
  .get(getVessels)
  .post(restrictTo('manager'), createVessel);

router.route('/:id')
  .get(getVessel)
  .put(updateVessel)
  .delete(restrictTo('manager'), deleteVessel);

module.exports = router;
