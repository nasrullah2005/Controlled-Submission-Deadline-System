const Submission = require('../models/Submission');
const Deadline = require('../models/Deadline');

// @desc    Create new submission
// @route   POST /api/submissions
// @access  Private/User
exports.createSubmission = async (req, res) => {
  try {
    const { title, content, deadlineId } = req.body;

    // Check if deadline exists
    const deadline = await Deadline.findById(deadlineId);

    if (!deadline) {
      return res.status(404).json({
        success: false,
        message: 'Deadline not found'
      });
    }

    // Check if deadline is active
    if (!deadline.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This deadline is not active for submissions'
      });
    }

    // CRITICAL: Check if deadline has passed
    const currentTime = new Date();
    if (currentTime > deadline.deadline) {
      return res.status(403).json({
        success: false,
        message: 'Submission deadline has passed. Late submissions are not accepted.',
        deadlineInfo: {
          deadline: deadline.deadline,
          currentTime: currentTime,
          timePassed: `${Math.floor((currentTime - deadline.deadline) / 1000)} seconds past deadline`
        }
      });
    }

    // Check if user has already submitted for this deadline
    const existingSubmission = await Submission.findOne({
      deadline: deadlineId,
      submittedBy: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted for this deadline'
      });
    }

    // Create submission
    const submission = await Submission.create({
      title,
      content,
      deadline: deadlineId,
      submittedBy: req.user.id,
      submittedAt: new Date(),
      status: 'on-time'
    });

    // Populate the submission
    const populatedSubmission = await Submission.findById(submission._id);

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: populatedSubmission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating submission',
      error: error.message
    });
  }
};

// @desc    Get all submissions (Admin)
// @route   GET /api/submissions
// @access  Private/Admin
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// @desc    Get submissions by deadline (Admin)
// @route   GET /api/submissions/deadline/:deadlineId
// @access  Private/Admin
exports.getSubmissionsByDeadline = async (req, res) => {
  try {
    const submissions = await Submission.find({ deadline: req.params.deadlineId })
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// @desc    Get my submissions (User)
// @route   GET /api/submissions/my
// @access  Private/User
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.user.id })
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your submissions',
      error: error.message
    });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Users can only view their own submissions, admins can view all
    if (req.user.role !== 'admin' && submission.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message
    });
  }
};

// @desc    Update submission (only before deadline)
// @route   PUT /api/submissions/:id
// @access  Private/User
exports.updateSubmission = async (req, res) => {
  try {
    let submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user owns the submission
    if (submission.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this submission'
      });
    }

    // Get the deadline to check if it has passed
    const deadline = await Deadline.findById(submission.deadline._id);
    
    // CRITICAL: Prevent updates after deadline
    if (new Date() > deadline.deadline) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update submission after deadline has passed'
      });
    }

    const { title, content } = req.body;

    submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { title, content },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Submission updated successfully',
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating submission',
      error: error.message
    });
  }
};

// @desc    Delete submission (only before deadline)
// @route   DELETE /api/submissions/:id
// @access  Private/User
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user owns the submission
    if (submission.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }

    // Get the deadline to check if it has passed
    const deadline = await Deadline.findById(submission.deadline._id);
    
    // CRITICAL: Prevent deletion after deadline
    if (new Date() > deadline.deadline) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete submission after deadline has passed'
      });
    }

    await submission.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting submission',
      error: error.message
    });
  }
};

// @desc    Get submission statistics (Admin)
// @route   GET /api/submissions/stats/:deadlineId
// @access  Private/Admin
exports.getSubmissionStats = async (req, res) => {
  try {
    const totalSubmissions = await Submission.countDocuments({ 
      deadline: req.params.deadlineId 
    });

    const onTimeSubmissions = await Submission.countDocuments({
      deadline: req.params.deadlineId,
      status: 'on-time'
    });

    const lateSubmissions = await Submission.countDocuments({
      deadline: req.params.deadlineId,
      status: 'late'
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalSubmissions,
        onTime: onTimeSubmissions,
        late: lateSubmissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submission statistics',
      error: error.message
    });
  }
};