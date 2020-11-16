module.exports = app => {
  const users = require("../controllers/userController.js");

  // Create a new Customer
  app.post("/LoginInfo", users.create,function(req, res) {
    console.log("function was actually called")
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
  });
};
