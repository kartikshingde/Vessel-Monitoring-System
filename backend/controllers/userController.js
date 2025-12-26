const User = require('../models/User');

//  GET /api/users?role=captain
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    // Build query
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
