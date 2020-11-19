module.exports = app => {
  const profile = require("../controllers/profileController.js");

  //Login
  app.post("/profileEdit", profile.edit);
};
