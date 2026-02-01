const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getAllSubmissions,
  getSubmissionsByDeadline,
  getMySubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionStats
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, authorize('user', 'admin'), createSubmission);
router.get('/my', protect, getMySubmissions);
router.get('/:id', protect, getSubmission);
router.put('/:id', protect, authorize('user', 'admin'), updateSubmission);
router.delete('/:id', protect, authorize('user', 'admin'), deleteSubmission);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllSubmissions);
router.get('/deadline/:deadlineId', protect, authorize('admin'), getSubmissionsByDeadline);
router.get('/stats/:deadlineId', protect, authorize('admin'), getSubmissionStats);

module.exports = router;