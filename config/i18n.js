const { I18N } = require("./packages");
const PATH = require("path");

// Configure i18n
I18N.configure({
  locales: ["en", "hi"],
  defaultLocale: "en",
  directory: PATH.join(__dirname, "../locales"),
  objectNotation: true,
  updateFiles: false,
  syncFiles: false,
  autoReload: false,
  cookie: "language",
  queryParameter: "lang",
  register: global,
});

module.exports = I18N;
