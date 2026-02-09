const RegisterRouter = require("./api/routes");
const { HTTP_STATUS_CODE } = require("./config/constants");
const { checkDBConnection } = require("./config/database");
const envConfig = require("./config/envConfig");
const { EXPRESS, CORS, FS } = require("./config/packages");

// EXPRESS APP SETUP
const app = EXPRESS();
const PORT = envConfig.SERVER.PORT || 1338;

// Middleware
app.use(CORS());
app.use(EXPRESS.json());
app.use(EXPRESS.urlencoded({ extended: true }));

// Create temporary uploads directory if not exists
const uploadsDir = "/tmp/uploads";
if (!FS.existsSync(uploadsDir)) {
  FS.mkdirSync(uploadsDir, { recursive: true });
}

// Health check
app.get("/health", (req, res) => {
  res.status(HTTP_STATUS_CODE.OK).json({
    success: true,
    message: "Server is running",
  });
});

// Routes
app.use(RegisterRouter);

// Start server
app.listen(PORT, async () => {
  await checkDBConnection();
  console.log(`🚀 Server running on port ${PORT}`);
});
