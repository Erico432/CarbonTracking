const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', activityController.createActivity);
router.get('/', activityController.getActivities);
router.get('/statistics', activityController.getStatistics);
router.get('/emission-factors', activityController.getEmissionFactors);
router.get('/:id', activityController.getActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;