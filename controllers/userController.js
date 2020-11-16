const User = require("../models/userModel.js");
const alert = require("js-alert");
// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body.UsernameRegister);
  // Create a Customer
  const user = new User({
    Username: req.body.UsernameRegister,
    Password: req.body.PasswordRegister
  });

  // Save Customer in the database
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    else{
    //res.send(data);
    console.log("Data was stored");
    alert.alert("Registreed");
    //popup.alert({content:'Registration successful! You may now login!'});
    res.redirect('/');
  }
  });
};
