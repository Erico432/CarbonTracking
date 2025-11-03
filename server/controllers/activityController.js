const Activity = require('../models/Activity');

// Carbon emission factors (kg CO2 per unit)
const emissionFactors = {
  transportation: {
    car: { factor: 0.21, unit: 'km' },
    bus: { factor: 0.089, unit: 'km' },
    train: { factor: 0.041, unit: 'km' },
    flight: { factor: 0.255, unit: 'km' },
    motorcycle: { factor: 0.113, unit: 'km' },
    bicycle: { factor: 0, unit: 'km' }
  },
  energy: {
    electricity: { factor: 0.5, unit: 'kWh' },
    naturalGas: { factor: 2.0, unit: 'm³' },
    heating: { factor: 2.5, unit: 'L' }
  },
  food: {
    beef: { factor: 27, unit: 'kg' },
    pork: { factor: 12.1, unit: 'kg' },
    chicken: { factor: 6.9, unit: 'kg' },
    fish: { factor: 6, unit: 'kg' },
    vegetables: { factor: 2, unit: 'kg' },
    dairy: { factor: 1.9, unit: 'kg' }
  },
  waste: {
    general: { factor: 0.5, unit: 'kg' },
    recycling: { factor: 0.1, unit: 'kg' },
    compost: { factor: 0.05, unit: 'kg' }
  },
  shopping: {
    clothing: { factor: 10, unit: 'item' },
    electronics: { factor: 50, unit: 'item' },
    furniture: { factor: 100, unit: 'item' }
  }
};

const calculateCarbonFootprint = (category, type, amount) => {
  const categoryFactors = emissionFactors[category];
  if (!categoryFactors || !categoryFactors[type]) {
    return 0;
  }
  return amount * categoryFactors[type].factor;
};

exports.createActivity = async (req, res) => {
  try {
    const { category, type, amount, unit, description, date } = req.body;

    const carbonFootprint = calculateCarbonFootprint(category, type, amount);

    const activity = new Activity({
      userId: req.userId,
      category,
      type,
      amount,
      unit,
      carbonFootprint,
      description,
      date: date || new Date()
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    let query = { userId: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (category) {
      query.category = category;
    }

    const activities = await Activity.find(query).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const { category, type, amount, unit, description, date } = req.body;

    let activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const carbonFootprint = calculateCarbonFootprint(
      category || activity.category,
      type || activity.type,
      amount || activity.amount
    );

    activity.category = category || activity.category;
    activity.type = type || activity.type;
    activity.amount = amount || activity.amount;
    activity.unit = unit || activity.unit;
    activity.carbonFootprint = carbonFootprint;
    activity.description = description !== undefined ? description : activity.description;
    activity.date = date || activity.date;

    await activity.save();
    res.json(activity);
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = { userId: req.userId };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const statistics = await Activity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalFootprint: { $sum: '$carbonFootprint' },
          count: { $sum: 1 }
        }
      }
    ]);

    const total = statistics.reduce((sum, stat) => sum + stat.totalFootprint, 0);

    res.json({
      total,
      byCategory: statistics
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmissionFactors = (req, res) => {
  res.json(emissionFactors);
};