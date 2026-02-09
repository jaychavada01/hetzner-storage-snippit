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
    ENDPOINT: process.env.HETZNER_ENDPOINT,
    BUCKET: process.env.HETZNER_BUCKET,
    ACCESS_KEY: process.env.HETZNER_ACCESS_KEY,
    SECRET_KEY: process.env.HETZNER_SECRET_KEY,
    REGION: process.env.HETZNER_REGION,
  },
};

Object.freeze(envConfig);

module.exports = envConfig;
