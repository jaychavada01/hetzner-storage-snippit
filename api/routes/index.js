// Import express
const express = require('express');

// Create router
const RegisterRouter = express.Router();


// Use routers
RegisterRouter.use('/', UserRoutes);

// Export routers
module.exports = RegisterRouter;
