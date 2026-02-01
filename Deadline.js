const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a deadline title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a deadline date and time']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
deadlineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if deadline has passed
deadlineSchema.methods.isPassed = function() {
  return new Date() > this.deadline;
};

module.exports = mongoose.model('Deadline', deadlineSchema);