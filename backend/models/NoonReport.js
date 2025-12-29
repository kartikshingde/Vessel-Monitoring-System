const mongoose = require('mongoose');

const noonReportSchema = new mongoose.Schema({
  vessel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vessel',
    required: true,
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  position: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  averageSpeed: { type: Number },
  distanceSinceLastNoon: { type: Number },
  fuelConsumedSinceLastNoon: { type: Number },
  fuelRob: { type: Number },
  weather: {
    remarks: { type: String },
  },
  remarks: { type: String },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('NoonReport', noonReportSchema);
