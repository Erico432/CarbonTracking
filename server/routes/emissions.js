// server/routes/emissions.js
const express = require('express');
const router = express.Router();
const {
  createEmission,
  getEmissions,
  getEmission,
  updateEmission,
  deleteEmission,
  getEmissionStats
} = require('../controllers/emissionController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getEmissions)
  .post(createEmission);

router.get('/stats', getEmissionStats);

router.route('/:id')
  .get(getEmission)
  .put(updateEmission)
  .delete(deleteEmission);

module.exports = router;
