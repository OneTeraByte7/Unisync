// server/routes/supplier.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// GET all suppliers
router.get('/', supplierController.getAllSuppliers);

// GET single supplier by ID
router.get('/:id', supplierController.getSupplierById);

// POST create new supplier
router.post('/', supplierController.createSupplier);

// PUT update supplier
router.put('/:id', supplierController.updateSupplier);

// DELETE supplier
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;