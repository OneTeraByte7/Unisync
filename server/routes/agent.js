const express = require('express');
const { executeAgentCommand } = require('../controllers/agentController');

const router = express.Router();

router.post('/execute', executeAgentCommand);

module.exports = router;
