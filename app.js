require("dotenv").config();

const { HTTP_STATUS_CODE } = require("./config/constants");
const { checkDBConnection } = require("./config/database");
const { EXPRESS, CORS, FS } = require("./config/packages");

// EXPRESS APP SETUP
const app = EXPRESS();
const PORT = process.env.PORT || 1338;

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

// Start server
app.listen(PORT, async () => {
  await checkDBConnection();
  console.log(`🚀 Server running on port ${PORT}`);
});
