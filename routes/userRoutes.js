//Externally defined routes for user related routes
module.exports = app => {
  const users = require("../controllers/userController.js");

  // Create a new user
  app.post("/LoginInfo", users.create);

  //Login
  app.post("/login_Auth", users.login);
};
