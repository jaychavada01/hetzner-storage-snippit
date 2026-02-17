require("dotenv").config({ quiet: true });

const envConfig = {
  SERVER: {
    PORT: process.env.PORT || 1338,
    NODE_ENV: process.env.NODE_ENV || "development",
  },
  DATABASE: {
    URL: process.env.DATABASE_URL,
  },
  STORAGE: {
    ENDPOINT: process.env.HETZNER_STORAGE_ENDPOINT,
    BUCKET: process.env.HETZNER_STORAGE_BUCKET,
    ACCESS_KEY: process.env.HETZNER_STORAGE_ACCESS_KEY,
    SECRET_KEY: process.env.HETZNER_STORAGE_SECRET_KEY,
    REGION: process.env.HETZNER_STORAGE_REGION,
  },
};

Object.freeze(envConfig);

module.exports = envConfig;
