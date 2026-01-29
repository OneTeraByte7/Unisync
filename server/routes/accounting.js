const express = require('express');
const {
  getAccountingEntries,
  createAccountingEntry,
  updateAccountingEntry,
  deleteAccountingEntry,
  getAccountingSummary,
} = require('../controllers/accountingController');

const router = express.Router();

router.get('/', getAccountingEntries);
router.get('/summary', getAccountingSummary);
router.post('/', createAccountingEntry);
router.put('/:id', updateAccountingEntry);
router.delete('/:id', deleteAccountingEntry);

module.exports = router;
