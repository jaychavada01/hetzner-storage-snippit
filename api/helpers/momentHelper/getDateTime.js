const { MOMENT } = require("../../../config/packages");

const GET_CURRENT_TIMESTAMP = () => {
  return MOMENT.utc().unix();
};

module.exports = {
  GET_CURRENT_TIMESTAMP,
};