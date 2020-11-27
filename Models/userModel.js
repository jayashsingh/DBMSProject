//User Model File


//Dependencies
const sql = require("./db.js");
var path = require('path');
const bcrypt = require("bcrypt");
const jwt =require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config.js");
// constructor
const User = function User(user) {
  this.Username = user.Username;
  this.Password = user.Password;
};

//User crreation function
User.create = (newUser, result) => {
  //SQL Query to insert new users login info
      sql.query("INSERT INTO LoginInfo SET ?", newUser, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }

        console.log("created customer: ", { id: res.insertId, ...newUser });
        result(null, { id: res.insertId, ...newUser });
      });

};

//User Login function
User.login = (user, result) => {
  //Checking if that username exists in DB
  sql.query("SELECT * FROM LoginInfo WHERE Username = ?",user.Username, (err, results) =>{
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    else {
      //Returned failed authentication if not found
      if(results.length<1)
      {
        result(null, 'failed');
        return;
      }
      //Comparing the passowrd inputted, and hashed password in db
      else {
        bcrypt.compare(user.Password, results[0].Password,(error,dataa)=>{
          //If they match, create and return the token
          if(dataa)
          {
            console.log("it ran through here too");
            const userToken= jwt.sign({Username: user.Username},jwtConfig.JWTPASSWORD,{expiresIn:"1h"});
            console.log("tokenaazzz "+userToken);
            result(null, { token: userToken});
          }
          //If they dont match, fail authentication
          else {
            console.log("it ran through 123123asdasdfsagds");
            result(null, 'failed');
            return;
          }
        })
      }
    }
  })

}

//Export so the user model can be used in other files
module.exports = User;
