// Import express
const express = require('express');
const storageRouter = require('./StorageRoutes');

// Create router
const RegisterRouter = express.Router();


// Use routers
RegisterRouter.use('/storage', storageRouter);

// Export routers
module.exports = RegisterRouter;
