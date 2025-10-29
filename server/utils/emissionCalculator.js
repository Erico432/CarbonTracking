// server/utils/emissionCalculator.js

// Emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  transportation: {
    car_gasoline: 0.24,        // kg CO2 per km
    car_diesel: 0.27,          // kg CO2 per km
    car_electric: 0.05,        // kg CO2 per km
    motorcycle: 0.14,          // kg CO2 per km
    bus: 0.089,                // kg CO2 per km
    train: 0.041,              // kg CO2 per km
    flight_short: 0.255,       // kg CO2 per km (< 1000km)
    flight_medium: 0.156,      // kg CO2 per km (1000-3000km)
    flight_long: 0.150,        // kg CO2 per km (> 3000km)
  },
  electricity: {
    grid_average: 0.475,       // kg CO2 per kWh (global average)
    renewable: 0.05,           // kg CO2 per kWh
    coal: 0.95,                // kg CO2 per kWh
    natural_gas: 0.45,         // kg CO2 per kWh
  },
  food: {
    beef: 27.0,                // kg CO2 per kg
    lamb: 39.2,                // kg CO2 per kg
    pork: 12.1,                // kg CO2 per kg
    chicken: 6.9,              // kg CO2 per kg
    fish: 6.1,                 // kg CO2 per kg
    eggs: 4.8,                 // kg CO2 per kg
    cheese: 13.5,              // kg CO2 per kg
    milk: 3.2,                 // kg CO2 per kg
    rice: 2.7,                 // kg CO2 per kg
    vegetables: 2.0,           // kg CO2 per kg
    fruits: 1.1,               // kg CO2 per kg
  },
  waste: {
    landfill: 0.5,             // kg CO2 per kg waste
    recycling: 0.1,            // kg CO2 per kg waste
    composting: 0.05,          // kg CO2 per kg waste
    incineration: 0.4,         // kg CO2 per kg waste
  }
};

/**
 * Calculate carbon emissions based on category and input data
 */
const calculateEmission = (category, subcategory, amount, metadata = {}) => {
  let emission = 0;

  switch (category) {
    case 'transportation':
      emission = calculateTransportEmission(subcategory, amount, metadata);
      break;
    case 'electricity':
      emission = calculateElectricityEmission(subcategory, amount);
      break;
    case 'food':
      emission = calculateFoodEmission(subcategory, amount);
      break;
    case 'waste':
      emission = calculateWasteEmission(subcategory, amount);
      break;
    default:
      throw new Error('Invalid category');
  }

  return parseFloat(emission.toFixed(2));
};

/**
 * Calculate transportation emissions
 */
const calculateTransportEmission = (vehicleType, distance, metadata) => {
  const factor = EMISSION_FACTORS.transportation[vehicleType] || 0.2;
  return distance * factor;
};

/**
 * Calculate electricity emissions
 */
const calculateElectricityEmission = (sourceType, kwh) => {
  const factor = EMISSION_FACTORS.electricity[sourceType] || 
                 EMISSION_FACTORS.electricity.grid_average;
  return kwh * factor;
};

/**
 * Calculate food emissions
 */
const calculateFoodEmission = (foodType, weight) => {
  const factor = EMISSION_FACTORS.food[foodType] || 2.0;
  return weight * factor;
};

/**
 * Calculate waste emissions
 */
const calculateWasteEmission = (disposalMethod, weight) => {
  const factor = EMISSION_FACTORS.waste[disposalMethod] || 
                 EMISSION_FACTORS.waste.landfill;
  return weight * factor;
};

/**
 * Get emission factors for frontend display
 */
const getEmissionFactors = () => {
  return EMISSION_FACTORS;
};

module.exports = {
  calculateEmission,
  getEmissionFactors,
  EMISSION_FACTORS
};
