const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const touristSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    touristId: { type: String, required: true, unique: true },
    nationality: { type: String, default: 'Indian' },
    passportNumber: { type: String, default: '' },
    safetyScore: { type: Number, default: 100, min: 0, max: 100 },
    safetyStatus: {
      type: String,
      enum: ['Safe', 'At Risk', 'Unsafe', 'Critical'],
      default: 'Safe',
    },
    currentLocation: {
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.209 },
      address: { type: String, default: 'New Delhi, India' },
      lastUpdated: { type: Date, default: Date.now },
    },
    locationHistory: [locationHistorySchema],
    totalAlerts: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    emergencyContact: { type: String, default: '' },
    visitPurpose: { type: String, default: 'Tourism' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tourist', touristSchema);
