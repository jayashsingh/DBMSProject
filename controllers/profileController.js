const Profile = require("../models/profileModel.js");
const sql = require("../models/db.js")
const bcrypt = require("bcrypt");
const jwt =require("jsonwebtoken");

exports.edit = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  sql.query("SELECT * FROM Profile WHERE Username =?",jwt.decode(req.cookies.user).Username, (err,data)=>{
    if(data.length>0)
    {

    }
    else {
      sql.query("SELECT MAX(ProfileID) AS MAXID FROM Profile",(err,results)=>{
        if(results.length>0)
        {
          var ID=results[0].MAXID + 1;
        }
        let employed=1;
        const profile = new Profile({
          ProfileID:  ID,
          FirstName:  req.body.FirstName,
          LastName: req.body.LastName,
          Email: req.body.Email,
          PhoneNumber: req.body.phoneNumber,
          Employed: employed,
          Username: jwt.decode(req.cookies.user).Username
        });
        console.log("Created profile")

        Profile.create(profile, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the Profile."
            });
          else{
          //res.send(data);
          console.log("Data was stored");
          res.render("Profile",{layout:false, message: 'Congrats, your profile was created!',firstname: req.body.FirstName});
        }
        });
      });
    }
  });

}
