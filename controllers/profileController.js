//File acting as the controller for profile objects

//Importing dependecies (model,connect,password encryption, web token)
const Profile = require("../models/profileModel.js");
const sql = require("../models/db.js")
const bcrypt = require("bcrypt");
const jwt =require("jsonwebtoken");

//Exporting add skill function
exports.addSkill = (req, res)=>{
  //If the form submition is empty
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  //Finding profile ID of current user
  sql.query("SELECT ProfileID FROM Profile WHERE Username=?",jwt.decode(req.cookies.user).Username, (err, data)=>{
    var profID = data[0].ProfileID;
    //Querying database to see if the inputted skill already exists for the user logged in
    sql.query("SELECT * FROM Skills WHERE ProfileID =? AND Skill=?",[profID, req.body.skill], (error,dataa)=>{
      if(dataa.length>0)
      {
        //Rending page with handlebars
        res.render("addSkill",{layout:false, message:'You already have that skill in your profile!'})
      }
      else {
        //Inserting into database
        sql.query("INSERT INTO Skills (profileID, Skill) VALUES (?,?)",[profID,req.body.skill], (errorr,dataaa)=>{
          if(errorr)throw errorr;
          console.log("Stored skill")
          //Re-routing to profile route defined in server.js
          res.redirect("/Profile")
        })
      }
    })
  })
}

//Add Education function that follows the same logic as above
exports.addEducation = (req,res)=>{
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  sql.query("SELECT ProfileID FROM Profile WHERE Username=?",jwt.decode(req.cookies.user).Username, (err, data)=>{
    var profID = data[0].ProfileID;
    sql.query("SELECT * FROM EducationExperience WHERE ProfileID=? AND School=? AND Degree=?",[profID,req.body.school,req.body.degree],(error,dataa)=>{
      if(dataa.length>0)
      {
        res.render("addEducation",{layout:false, message:'You already have that education experience in your profile!'})
      }
      else {
        sql.query("INSERT INTO EducationExperience (profileID, Degree, School, Achievements, YearStarted, YearFinished) VALUES (?,?,?,?,?,?)",[profID,req.body.degree,req.body.school,req.body.achievements,req.body.startingyear,req.body.endingyear], (errorr,dataaa)=>{
          if(errorr)throw errorr;
          console.log("Stored education")
          res.redirect("/Profile")
        })
      }
    })
  })
}

//Add work experience function that follows the same general logic as above
exports.addWork = (req,res)=>{
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  sql.query("SELECT ProfileID FROM Profile WHERE Username=?",jwt.decode(req.cookies.user).Username, (err, data)=>{
    var profID = data[0].ProfileID;
    sql.query("SELECT CompanyID FROM Company WHERE Name LIKE '%" +req.body.Name+ "%'",(error,dataa)=>{
      var compID=dataa[0].CompanyID
      sql.query("SELECT * FROM WorkExperience WHERE ProfileID=? AND CompanyID=? AND Position=?",[profID, compID, req.body.position], (errorr,dataaa)=>{
        if(dataaa.length>0)
        {
          res.render("addWork",{layout:false, message:'You already have that work experience in your profile!'})
        }
        else {
          sql.query("INSERT INTO WorkExperience (profileID, CompanyID, Position, EmploymentType, DescriptionOfWork, NumberOfMonthsWorked) VALUES (?,?,?,?,?,?)",[profID,compID,req.body.position,req.body.employmentType, req.body.workDescription, req.body.monthsWorked], (errorrr,dataaaa)=>{
            if(errorrr)throw errorrr;
            res.redirect("./Profile")

          })
        }
      })
    })
  })
}

//Profile creation function
exports.edit = (req, res) => {
  //Same logic as above
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
      //Calculating id of new user
      sql.query("SELECT MAX(ProfileID) AS MAXID FROM Profile",(err,results)=>{
        if(results.length>0)
        {
          var ID=results[0].MAXID + 1;
        }
        let employed='1';
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

        //Calling create function from profile model
        Profile.create(profile, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the Profile."
            });
          else{
            //Storing skills, education experience, and work experience along with the new profile that was created
            sql.query("INSERT INTO Skills (profileID, Skill) VALUES (?,?)",[ID,req.body.skill], (errorr,dataaa)=>{
              if(errorr)throw errorr;
              console.log("Stored skill")
              sql.query("INSERT INTO EducationExperience (profileID, Degree, School, Achievements, YearStarted, YearFinished) VALUES (?,?,?,?,?,?)",[ID,req.body.degree,req.body.school,req.body.achievements,req.body.startingyear,req.body.endingyear], (errorr,dataaa)=>{
                if(errorr)throw errorr;
                console.log("Stored education")
                sql.query("SELECT CompanyID FROM Company WHERE Name LIKE '%" +req.body.Name+ "%'",(error,dataa)=>{
                  var compID=dataa[0].CompanyID
                  sql.query("INSERT INTO WorkExperience (profileID, CompanyID, Position, EmploymentType, DescriptionOfWork, NumberOfMonthsWorked) VALUES (?,?,?,?,?,?)",[ID,compID,req.body.position,req.body.employmentType, req.body.workDescription, req.body.monthsWorked], (errorrr,dataaaa)=>{
                    if(errorrr)throw errorrr;

                  })
                })
              })
            })
          console.log("Data was stored");
          //Re-routing to profile route defined in server.js
          res.redirect("/Profile");
        }
        });
      });
    }
  });

}

//Updating profile info function, following same logic as above
exports.update = (req,res)=>{
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  sql.query("SELECT ProfileID FROM Profile WHERE Username=?",jwt.decode(req.cookies.user).Username, (err, data)=>{
    var profID = data[0].ProfileID;
    //SQL statement for updating profile information
    sql.query("UPDATE Profile SET FirstName =?, LastName=?, Email=?,PhoneNumber=? WHERE ProfileId=?",[req.body.FirstName,req.body.LastName,req.body.Email,req.body.phoneNumber,profID],(error,dataa)=>{
      if(error)throw error;
      res.redirect("./Profile");
    })
  })
}
