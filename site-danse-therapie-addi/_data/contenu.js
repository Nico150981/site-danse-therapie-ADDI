const { getContenu } = require("../lib/googleSheet.js");

module.exports = async function () {
  return getContenu();
};
