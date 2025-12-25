const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vessel name is required'],
      trim: true,
    },
    mmsi: {
      type: String,
      required: [true, 'MMSI is required'],
      unique: true,
      trim: true,
    },
    captainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    position: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    speed: {
      type: Number,
      default: 0,
      min: 0,
    },
    heading: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },
    status: {
      type: String,
      enum: ['active', 'docked', 'maintenance'],
      default: 'active',
    },
    positionHistory: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Limit position history to last 50 entries
vesselSchema.pre('save', function (next) {
  if (this.positionHistory.length > 50) {
    this.positionHistory = this.positionHistory.slice(-50);
  }
  next();
});

module.exports = mongoose.model('Vessel', vesselSchema);
