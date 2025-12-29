const express = require('express');
const {
  getVessels,
  getVessel,
  createVessel,
  updateVessel,
  deleteVessel,
  submitNoonReport,   // ADD THIS
  getNoonReports,     // ADD THIS
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

// ADD NOON REPORT ROUTES
router.post('/:id/noon-report', restrictTo('captain'), submitNoonReport);
router.get('/:id/noon-reports', getNoonReports);

module.exports = router;
