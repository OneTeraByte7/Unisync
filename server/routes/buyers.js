const express = require('express');
const {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer,
} = require('../controllers/buyerController');

const router = express.Router();

router.get('/', getAllBuyers);
router.get('/:id', getBuyerById);
router.post('/', createBuyer);
router.put('/:id', updateBuyer);
router.delete('/:id', deleteBuyer);

module.exports = router;
