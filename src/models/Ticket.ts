import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
  },
  reportedBy: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending',
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 2000,
  },
  messages: [{
    role: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
reportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report; 