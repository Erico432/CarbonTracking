// server/models/Emission.js
const mongoose = require('mongoose');

const emissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['transportation', 'electricity', 'food', 'waste'],
    required: [true, 'Please specify emission category']
  },
  subcategory: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  carbonEmission: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  metadata: {
    distance: Number,           // For transportation
    vehicleType: String,        // For transportation
    fuelType: String,           // For transportation
    kwh: Number,                // For electricity
    foodType: String,           // For food
    wasteType: String,          // For waste
    disposalMethod: String      // For waste
  }
}, {
  timestamps: true
});

// Index for efficient queries
emissionSchema.index({ user: 1, date: -1 });
emissionSchema.index({ category: 1 });

module.exports = mongoose.model('Emission', emissionSchema);
