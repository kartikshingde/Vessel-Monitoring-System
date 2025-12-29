const Vessel = require("../models/Vessel");
const NoonReport = require('../models/NoonReport');

// GET /api/vessels
exports.getVessels = async (req, res) => {
  try {
    let query = {};

    // If captain, only show their vessel
    if (req.user.role === "captain") {
      query.captainId = req.user._id;
    }

    const vessels = await Vessel.find(query).populate(
      "captainId",
      "name email role"
    );

    res.json({
      success: true,
      count: vessels.length,
      data: vessels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/vessels/:id
exports.getVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id).populate(
      "captainId",
      "name email"
    );

    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: "Vessel not found",
      });
    }

    if (
      req.user.role === "captain" &&
      vessel.captainId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this vessel",
      });
    }

    res.json({
      success: true,
      data: vessel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/vessels
exports.createVessel = async (req, res) => {
  try {
    const { name, mmsi, captainId, position, speed, heading, status } = req.body;

    if (!name || !mmsi) {
      return res.status(400).json({
        success: false,
        message: "Please provide vessel name and MMSI",
      });
    }

    const existingVessel = await Vessel.findOne({ mmsi });
    if (existingVessel) {
      return res.status(400).json({
        success: false,
        message: "Vessel with this MMSI already exists",
      });
    }

    const vessel = await Vessel.create({
      name,
      mmsi,
      captainId: captainId || null,
      position: position || { lat: 0, lng: 0 },
      speed: speed || 0,
      heading: heading || 0,
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      data: vessel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/vessels/:id
exports.updateVessel = async (req, res) => {
  try {
    let vessel = await Vessel.findById(req.params.id);

    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: "Vessel not found",
      });
    }

    if (
      req.user.role === "captain" &&
      vessel.captainId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this vessel",
      });
    }

    if (req.user.role === "captain" && req.body.captainId) {
      delete req.body.captainId;
    }

    vessel = await Vessel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: vessel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/vessels/:id
exports.deleteVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);

    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: "Vessel not found",
      });
    }

    await vessel.deleteOne();

    res.json({
      success: true,
      message: "Vessel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/vessels/:id/noon-report
exports.submitNoonReport = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    
    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: 'Vessel not found',
      });
    }

    // Verify captain is assigned to this vessel
    if (vessel.captainId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this vessel',
      });
    }

    const noonReport = await NoonReport.create({
      vessel: vessel._id,
      captain: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: noonReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/vessels/:id/noon-reports
exports.getNoonReports = async (req, res) => {
  try {
    const reports = await NoonReport.find({ vessel: req.params.id })
      .populate('captain', 'name email')
      .sort({ reportedAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
