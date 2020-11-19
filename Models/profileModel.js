const sql = require("./db.js");
var path = require('path');
const bcrypt = require("bcrypt");
const jwt =require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config.js");
// constructor
const Profile = function Profile(profile) {
  this.ProfileID = profile.ProfileID;
  this.FirstName = profile.FirstName;
  this.LastName = profile.LastName;
  this.Email = profile.Email;
  this.PhoneNumber = profile.PhoneNumber;
  this.Employed = profile.Emplyed;
  this.Username = profile.Username;
};

Profile.create = (newProfile, result) => {
  //Check if user exists already
      sql.query("INSERT INTO Profile SET ?", newProfile, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }

        console.log("created Profile: ", { id: res.insertId, ...newProfile });
        result(null, { id: res.insertId, ...newProfile });
      });

};

module.exports = Profile;
