const express = require('express');
const {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  buyInventoryItem,
  sellInventoryItem,
  getInventoryTransactions,
  getInventoryAnalytics,
} = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', getAllInventoryItems);
router.get('/analytics/summary', getInventoryAnalytics);
router.get('/transactions', getInventoryTransactions);
router.get('/:id', getInventoryItemById);
router.get('/:id/transactions', getInventoryTransactions);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.post('/:id/buy', buyInventoryItem);
router.post('/:id/sell', sellInventoryItem);

module.exports = router;
