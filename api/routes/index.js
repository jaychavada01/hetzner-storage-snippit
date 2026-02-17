// Import express
const express = require("express");
const storageRouter = require("./StorageRoutes");
const mediaRoutes = require("./media.routes");
const feedRoutes = require("./feed.routes");

// Create router
const RegisterRouter = express.Router();

// Use routers
RegisterRouter.use("/storage", storageRouter);

RegisterRouter.use("/api/media", mediaRoutes);
RegisterRouter.use("/api/feed", feedRoutes);

// Export routers`
module.exports = RegisterRouter;
