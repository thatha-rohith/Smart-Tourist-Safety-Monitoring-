const mongoose = require('mongoose');

const efirSchema = new mongoose.Schema(
  {
    efirNumber: { type: String, required: true, unique: true },
    tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'Tourist', required: true },
    alert: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
    incidentType: {
      type: String,
      enum: ['Theft', 'Assault', 'Missing Person', 'Accident', 'Harassment', 'Lost Documents', 'Medical Emergency', 'Other'],
      default: 'Other',
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, default: '' },
    },
    incidentDate: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Closed'],
      default: 'Pending',
    },
    source: { type: String, default: 'Police Dashboard' },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responseAction: { type: String, default: 'E-FIR Generated' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EFIR', efirSchema);
