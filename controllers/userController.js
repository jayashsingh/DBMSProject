const User = require("../models/userModel.js");
const sql = require("../models/db.js")
const bcrypt = require("bcrypt");
// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  console.log(req.body.UsernameRegister);
  //Check if user exists already
  sql.query("SELECT Username FROM LoginInfo WHERE Username = '"+req.body.UsernameRegister+"'",function(err,res1,field){
    if (err)
    {
      console.log("lengthazz" + res1.length);
    }

    if(res1.length>0)
    {
       res.render("register",{layout:false, message: 'User exists with that username!'});
      //res.redirect('/register.html');
    }
    else {
      bcrypt.hash(req.body.PasswordRegister, 10, (err, hash)=>{
        if (err)
        {
          console.log(err)
        }
        else {
          const user = new User({
            Username: req.body.UsernameRegister,
            Password: hash
          });

          console.log('userregister'+user);
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
            res.render("editProfile",{layout:false, message: 'Congrats, your account was created!'});
          }
          });
        }
      })
      // Create a Customer

    }
  });

};

exports.login = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  else {
    const user = new User({
      Username: req.body.Username,
      Password: req.body.Password
    });
    console.log("userrrr: "+user);
    console.log("userrrr: "+req.body.Username);
    console.log("userrrr: "+req.body.Password);
    User.login(user, (err, data)=>{
      if (err)
      {
        res.status(500).send({
          message:
            err.message || "Some error occurred while logging in the User."
        });
      }
      else if (data=='failed')
      {
        console.log("User not logged in");
        res.render("login",{layout:false, failureMessage: 'Email or Password incorrect! Please try again.'});
      }
      else {
        console.log("data"+data.token);
        const userToken=data.token;
        res.cookie('user',userToken,{maxAge:3600000,httpOnly:true}).redirect('/Main');
      }


    });
  }



}
