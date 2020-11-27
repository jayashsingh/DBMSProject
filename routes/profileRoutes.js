//File for handing routes defined externally that are related to profile

module.exports = app => {
  const profile = require("../controllers/profileController.js");

  //Creation
  app.post("/profileEdit", profile.edit);
  //Adding skills
  app.post("/skillEdit", profile.addSkill);
  //Adding education experience
  app.post("/educationEdit",profile.addEducation);
  //Adding work experience
  app.post("/workEdit", profile.addWork);
  //Updating profile route
  app.post("/profileUpdate",profile.update);
};
