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

// All routes require authentication
router.use(protect);

// GET all vessels, POST create vessel
router
  .route('/')
  .get(getVessels)
  .post(restrictTo('manager'), createVessel);

// GET single vessel, PUT update, DELETE vessel
router
  .route('/:id')
  .get(getVessel)
  .put(updateVessel)
  .delete(restrictTo('manager'), deleteVessel);

module.exports = router;


