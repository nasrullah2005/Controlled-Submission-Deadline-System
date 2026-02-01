const express = require('express');
const router = express.Router();
const {
  createDeadline,
  getDeadlines,
  getActiveDeadlines,
  getDeadline,
  updateDeadline,
  deleteDeadline,
  toggleDeadlineStatus
} = require('../controllers/deadlineController');
const { protect, authorize } = require('../middleware/auth');

// Public/User routes
router.get('/active', protect, getActiveDeadlines);
router.get('/:id', protect, getDeadline);
router.get('/', protect, getDeadlines);

// Admin only routes
router.post('/', protect, authorize('admin'), createDeadline);
router.put('/:id', protect, authorize('admin'), updateDeadline);
router.delete('/:id', protect, authorize('admin'), deleteDeadline);
router.patch('/:id/toggle', protect, authorize('admin'), toggleDeadlineStatus);

module.exports = router;