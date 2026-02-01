const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a submission title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please provide submission content'],
    trim: true
  },
  deadline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deadline',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['on-time', 'late'],
    default: 'on-time'
  }
});

// Populate user details when querying
submissionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'submittedBy',
    select: 'name email'
  }).populate({
    path: 'deadline',
    select: 'title deadline'
  });
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);