// server/controllers/emissionController.js
const Emission = require('../models/Emission');
const User = require('../models/User');
const { calculateEmission } = require('../utils/emissionCalculator');

// @desc    Create new emission record
// @route   POST /api/emissions
// @access  Private
exports.createEmission = async (req, res) => {
  try {
    const { category, subcategory, amount, unit, description, metadata } = req.body;

    // Validate required fields
    if (!category || !subcategory || !amount || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Calculate carbon emission
    const carbonEmission = calculateEmission(
      category,
      subcategory,
      amount,
      metadata
    );

    // Create emission record
    const emission = await Emission.create({
      user: req.user.id,
      category,
      subcategory,
      amount,
      unit,
      carbonEmission,
      description,
      metadata
    });

    // Update user's total emissions
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { totalEmissions: carbonEmission } }
    );

    // Emit socket event for real-time update
    if (req.io) {
      req.io.to(req.user.id.toString()).emit('newEmission', {
        emission,
        totalEmissions: req.user.totalEmissions + carbonEmission
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emission record created successfully',
      data: { emission }
    });

  } catch (error) {
    console.error('Create emission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating emission record',
      error: error.message
    });
  }
};

// @desc    Get all emissions for logged in user
// @route   GET /api/emissions
// @access  Private
exports.getEmissions = async (req, res) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { user: req.user.id };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const emissions = await Emission.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Emission.countDocuments(query);

    res.status(200).json({
      success: true,
      count: emissions.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { emissions }
    });

  } catch (error) {
    console.error('Get emissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emissions',
      error: error.message
    });
  }
};

// @desc    Get emission statistics
// @route   GET /api/emissions/stats
// @access  Private
exports.getEmissionStats = async (req, res) => {
  try {
    const { timeRange } = req.query;

    // Build match query based on time range
    const matchQuery = { user: req.user.id };

    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        matchQuery.date = { $gte: startDate };
      }
    }

    // Aggregate statistics by category
    const categoryStats = await Emission.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalEmissions: { $sum: '$carbonEmission' },
          count: { $sum: 1 },
          average: { $avg: '$carbonEmission' }
        }
      },
      { $sort: { totalEmissions: -1 } }
    ]);

    // Get total emissions and other stats
    const totalStats = await Emission.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalEmissions: { $sum: '$carbonEmission' },
          totalEntries: { $sum: 1 },
          averageEmission: { $avg: '$carbonEmission' },
          highestEmission: { $max: '$carbonEmission' }
        }
      }
    ]);

    const stats = totalStats[0] || {
      totalEmissions: 0,
      totalEntries: 0,
      averageEmission: 0,
      highestEmission: 0
    };

    res.status(200).json({
      success: true,
      data: {
        totalEmissions: stats.totalEmissions,
        totalEntries: stats.totalEntries,
        averageEmission: stats.averageEmission,
        highestEmission: stats.highestEmission,
        categoryBreakdown: categoryStats
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get single emission
// @route   GET /api/emissions/:id
// @access  Private
exports.getEmission = async (req, res) => {
  try {
    const emission = await Emission.findById(req.params.id);

    if (!emission) {
      return res.status(404).json({
        success: false,
        message: 'Emission not found'
      });
    }

    // Make sure user owns emission
    if (emission.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this emission'
      });
    }

    res.status(200).json({
      success: true,
      data: { emission }
    });

  } catch (error) {
    console.error('Get emission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emission',
      error: error.message
    });
  }
};

// @desc    Update emission
// @route   PUT /api/emissions/:id
// @access  Private
exports.updateEmission = async (req, res) => {
  try {
    let emission = await Emission.findById(req.params.id);

    if (!emission) {
      return res.status(404).json({
        success: false,
        message: 'Emission not found'
      });
    }

    // Make sure user owns emission
    if (emission.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this emission'
      });
    }

    // Store old carbon emission for user total update
    const oldCarbonEmission = emission.carbonEmission;

    // If amount or category changed, recalculate emission
    if (req.body.amount || req.body.category || req.body.subcategory) {
      const amount = req.body.amount || emission.amount;
      const category = req.body.category || emission.category;
      const subcategory = req.body.subcategory || emission.subcategory;
      const metadata = req.body.metadata || emission.metadata;

      req.body.carbonEmission = calculateEmission(
        category,
        subcategory,
        amount,
        metadata
      );
    }

    emission = await Emission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update user's total emissions
    const emissionDifference = emission.carbonEmission - oldCarbonEmission;
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { totalEmissions: emissionDifference } }
    );

    res.status(200).json({
      success: true,
      message: 'Emission updated successfully',
      data: { emission }
    });

  } catch (error) {
    console.error('Update emission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating emission',
      error: error.message
    });
  }
};

// @desc    Delete emission
// @route   DELETE /api/emissions/:id
// @access  Private
exports.deleteEmission = async (req, res) => {
  try {
    const emission = await Emission.findById(req.params.id);

    if (!emission) {
      return res.status(404).json({
        success: false,
        message: 'Emission not found'
      });
    }

    // Make sure user owns emission
    if (emission.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this emission'
      });
    }

    // Update user's total emissions before deleting
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { totalEmissions: -emission.carbonEmission } }
    );

    await emission.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Emission deleted successfully',
      data: {}
    });

  } catch (error) {
    console.error('Delete emission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting emission',
      error: error.message
    });
  }
};
