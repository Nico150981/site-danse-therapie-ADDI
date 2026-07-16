const { getContenu } = require("../lib/googleSheet.js");

module.exports = async function () {
  const rows = await getContenu();
  return rows.filter((row) => row.type === "article");
};
