const express = require('express');
const { getUsers } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require auth + manager role
router.use(protect);
router.use(restrictTo('manager'));

router.get('/', getUsers);

module.exports = router;
