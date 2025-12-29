const mongoose = require("mongoose");
const vesselSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mmsi: { type: String, required: true, unique: true },
    captainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    position: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    currentPosition: {
      // ADD THIS
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      timestamp: { type: Date, default: Date.now },
    },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "docked", "maintenance"],
      default: "active",
    },
    destination: { type: String }, // ADD THIS
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('Vessel', vesselSchema);
