const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Document must belong to a user'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: {
        values: ['English', 'Hindi', 'Marathi'],
        message: 'Language must be English, Hindi or Marathi',
      },
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    amounts: {
      type: [String],
      default: [],
    },
    dates: {
      type: [String],
      default: [],
    },
    actionSteps: {
      type: [String],
      default: [],
    },
    warnings: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('Document', documentSchema);
