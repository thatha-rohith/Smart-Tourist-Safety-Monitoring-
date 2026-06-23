const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    broadcastType: {
      type: String,
      enum: ['Radius', 'Zone', 'Region', 'All Tourists'],
      required: true,
    },
    isEmergency: { type: Boolean, default: false },
    targetZone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
    radius: { type: Number, default: 0 },
    centerLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    region: { type: String, default: '' },
    recipientsCount: { type: Number, default: 0 },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Sent', 'Scheduled', 'Failed'],
      default: 'Sent',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Broadcast', broadcastSchema);
