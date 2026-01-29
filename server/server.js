// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supplierRoutes = require('./routes/supplier');
const buyerRoutes = require('./routes/buyers');
const inventoryRoutes = require('./routes/inventory');
const qualityRoutes = require('./routes/quality');
const accountingRoutes = require('./routes/accounting');
const dashboardRoutes = require('./routes/dashboard');
const crmRoutes = require('./routes/crm');
const hrRoutes = require('./routes/hr');
const agentRoutes = require('./routes/agent');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});