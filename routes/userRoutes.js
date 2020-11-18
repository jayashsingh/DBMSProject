module.exports = app => {
  const users = require("../controllers/userController.js");

  // Create a new Customer
  app.post("/LoginInfo", users.create);

  //Login
  app.post("/login_Auth", users.login);
};
