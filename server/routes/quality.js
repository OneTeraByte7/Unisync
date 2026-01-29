const express = require('express');
const {
  getQualityChecks,
  createQualityCheck,
  updateQualityCheck,
  deleteQualityCheck,
  getQualitySummary,
} = require('../controllers/qualityController');

const router = express.Router();

router.get('/', getQualityChecks);
router.get('/summary', getQualitySummary);
router.post('/', createQualityCheck);
router.put('/:id', updateQualityCheck);
router.delete('/:id', deleteQualityCheck);

module.exports = router;
