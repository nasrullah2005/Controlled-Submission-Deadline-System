const Deadline = require('../models/Deadline');

// @desc    Create new deadline
// @route   POST /api/deadlines
// @access  Private/Admin
exports.createDeadline = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be in the future'
      });
    }

    const newDeadline = await Deadline.create({
      title,
      description,
      deadline: deadlineDate,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Deadline created successfully',
      data: newDeadline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating deadline',
      error: error.message
    });
  }
};

// @desc    Get all deadlines
// @route   GET /api/deadlines
// @access  Private
exports.getDeadlines = async (req, res) => {
  try {
    const deadlines = await Deadline.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: deadlines.length,
      data: deadlines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deadlines',
      error: error.message
    });
  }
};

// @desc    Get active deadlines
// @route   GET /api/deadlines/active
// @access  Private
exports.getActiveDeadlines = async (req, res) => {
  try {
    const now = new Date();
    const deadlines = await Deadline.find({
      isActive: true,
      deadline: { $gt: now }
    })
      .populate('createdBy', 'name email')
      .sort('deadline');

    res.status(200).json({
      success: true,
      count: deadlines.length,
      data: deadlines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active deadlines',
      error: error.message
    });
  }
};

// @desc    Get single deadline
// @route   GET /api/deadlines/:id
// @access  Private
exports.getDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!deadline) {
      return res.status(404).json({
        success: false,
        message: 'Deadline not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deadline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deadline',
      error: error.message
    });
  }
};

// @desc    Update deadline
// @route   PUT /api/deadlines/:id
// @access  Private/Admin
exports.updateDeadline = async (req, res) => {
  try {
    let deadline = await Deadline.findById(req.params.id);

    if (!deadline) {
      return res.status(404).json({
        success: false,
        message: 'Deadline not found'
      });
    }

    // If updating deadline date, ensure it's in the future
    if (req.body.deadline) {
      const newDeadlineDate = new Date(req.body.deadline);
      if (newDeadlineDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Deadline must be in the future'
        });
      }
    }

    deadline = await Deadline.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Deadline updated successfully',
      data: deadline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating deadline',
      error: error.message
    });
  }
};

// @desc    Delete deadline
// @route   DELETE /api/deadlines/:id
// @access  Private/Admin
exports.deleteDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);

    if (!deadline) {
      return res.status(404).json({
        success: false,
        message: 'Deadline not found'
      });
    }

    await deadline.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Deadline deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting deadline',
      error: error.message
    });
  }
};

// @desc    Toggle deadline active status
// @route   PATCH /api/deadlines/:id/toggle
// @access  Private/Admin
exports.toggleDeadlineStatus = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);

    if (!deadline) {
      return res.status(404).json({
        success: false,
        message: 'Deadline not found'
      });
    }

    deadline.isActive = !deadline.isActive;
    await deadline.save();

    res.status(200).json({
      success: true,
      message: `Deadline ${deadline.isActive ? 'activated' : 'deactivated'} successfully`,
      data: deadline
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling deadline status',
      error: error.message
    });
  }
};