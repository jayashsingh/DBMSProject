module.exports = app => {
  const profile = require("../controllers/profileController.js");

  //Login
  app.post("/profileEdit", profile.edit);
  app.post("/skillEdit", profile.addSkill);
  app.post("/educationEdit",profile.addEducation);
  app.post("/workEdit", profile.addWork);
  app.post("/profileUpdate",profile.update);
};
