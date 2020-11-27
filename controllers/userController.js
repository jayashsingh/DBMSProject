//Controller file handling user objects

//Dependencies
const User = require("../models/userModel.js");
const sql = require("../models/db.js")
const bcrypt = require("bcrypt");
const jwt =require("jsonwebtoken");
// Create and Save a new User
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
      throw err;
    }

    if(res1.length>0)
    {
       res.render("register",{layout:false, message: 'User exists with that username!'});
    }
    else {
      //Hashing password
      bcrypt.hash(req.body.PasswordRegister, 10, (err, hash)=>{
        if (err)
        {
          console.log(err)
        }
        else {
          //Creating user from user constructor in user model
          const user = new User({
            Username: req.body.UsernameRegister,
            Password: hash
          });

          console.log('userregister'+user);
          // Save User in the database
          User.create(user, (err, data) => {
            if (err)
              res.status(500).send({
                message:
                  err.message || "Some error occurred while creating the User."
              });
            else{
            //Rendering next page with handlebars and express
            console.log("Data was stored");
            res.render("login",{layout:false, message: 'Congrats, your account was created!'});
          }
          });
        }
      })
    }
  });

};

//login function for user
exports.login = (req, res) => {
  console.log("TEST"+req.body)
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  else {
    //creating user object
    const user = new User({
      Username: req.body.Username,
      Password: req.body.Password
    });
    //calling login function from user model
    User.login(user, (err, data)=>{
      if (err)
      {
        res.status(500).send({
          message:
            err.message || "Some error occurred while logging in the User."
        });
      }
      //if login failed
      else if (data=='failed')
      {
        console.log("User not logged in");
        res.render("login",{layout:false, failureMessage: 'Email or Password incorrect! Please try again.'});
      }
      //if login succeeded
      else {
        console.log("data"+data.token);
        const userToken=data.token;
        const token_username=jwt.decode(userToken).Username;
        //create a cookie storing the user jw token
        res.cookie('user',userToken,{maxAge:3600000,httpOnly:true})
        //Checking if first time user or returning user
        sql.query("SELECT * FROM Profile WHERE Username= ?",token_username, (err,results) =>{
          if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
          }
          else {
            //If first time, send to profile creation
            if(results.length<1)
            {
              res.redirect('/editProfile');
            }
            //If returning, send to main page
            else {
              res.redirect('/Main');
            }
          }
        })

      }


    });
  }



}
