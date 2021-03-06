//Packages and dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var server = http.Server(app);
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const hbs= require("hbs");
const jwt =require("jsonwebtoken");
const jwtConfig = require("./config/jwt.config.js");
const sql = require("./models/db.js");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

//External route files
require("./routes/userRoutes.js")(app);
require("./routes/profileRoutes.js")(app);


//View Engine - handlebars
app.set('view engine', 'hbs');
hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

//Internal routes

//Route route, checking if user is logged in render main page, if not render login page
app.get('/', function(request, response) {
  if(request.cookies.user)
  {
    response.render("Main");
  }
  else {
    response.render("login");
  }
});
//Login route
app.get('/login', function(request, response) {
  response.render("login");
});
//Register route
app.get('/register', function(request, response) {
  response.render("register",{layout:false});
});
//Main page route
app.get('/Main', checkToken , (request, response)=> {
  response.render("Main",{layout:false});
});
//Profile creation route
app.get('/editProfile', checkToken , (request, response)=> {
  response.render("editProfile",{layout:false});
});
//Adding skill route
app.get('/addSkill', function(request, response) {
  response.render("addSkill",{layout:false});
});
//Adding education route
app.get('/addEducation', function(request, response) {
  response.render("addEducation",{layout:false});
});
//Adding work route
app.get('/addWork', function(request, response) {
  response.render("addWork",{layout:false});
});
//Update profile route
app.get('/updateProfile', function(request, response) {
  //Sql query to fill html form with existing info for the profile
  sql.query("SELECT * From Profile WHERE Username=?",jwt.decode(request.cookies.user).Username,(err,data)=>{
      response.render("updateProfile",{layout:false,fname:data[0].FirstName, lname:data[0].LastName,email:data[0].Email,pnum:data[0].PhoneNumber});
  })


});
//Profile Page route
app.get('/Profile', checkToken , (request, response)=> {
  let names = new Array();
  //sql queries to get all the info from the db that displays on profile page
  sql.query("SELECT * FROM Profile WHERE Username =?",jwt.decode(request.cookies.user).Username, (err, data)=>{
    console.log("Step 1"+data);
    sql.query("SELECT * FROM Skills WHERE ProfileID =?",data[0].ProfileID,(errr,dataa)=>{
      console.log("Step 2"+dataa[0].Skill);
      sql.query("SELECT * FROM EducationExperience WHERE ProfileID =?",data[0].ProfileID, (errrr,dataaa)=>{
        console.log("Step 3"+dataaa);
        sql.query("SELECT * FROM WorkExperience WHERE ProfileID =?",data[0].ProfileID, (errrrr,dataaaa)=>{
          console.log("Step 4"+dataaaa);
          //Promise to make sure this for each loop is committed synchronously
          var foreachPromise1 = new Promise((resolve,reject)=>{
            dataaaa.forEach((item,idx) => {
              sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.CompanyID, (error, dataaaaa)=>{
              names.push(dataaaaa[0].Name);

              console.log("I should show names "+names);
              console.log(names[0]);
              if(idx===dataaaa.length-1)resolve();
              })
            });

          });
          foreachPromise1.then(()=>{
            console.log("Step 5"+names);
              console.log("Step 6");
              response.render("Profile",{layout:false,profile: data, skills:dataa,eduexp:dataaa,workexp:dataaaa,companyNames:names});
          })

        })
      })
    })
  });
});
//Company page route
app.get('/Companys', checkToken , (request, response)=> {
  sql.query("SELECT * FROM Company",(err,data)=>{
    console.log("I come first");
    if(data.length==0)
    {
      console.log("Nothing loaded");
    }
    else
    {
      console.log(data.length);
        response.render("Companys",{layout:false, results: data});
    }
  })

});
//Suggested search route, executes view 9
app.get("/ITWorkfield",checkToken,(req,res)=>{
  sql.query("SELECT * FROM VIEW9",(err,data)=>{
    res.render("Companys",{layout:false,results:data});
  })
})
//Profiles page route
app.get('/profileList', checkToken , (request, response)=> {
  sql.query("SELECT * FROM Profile",(err,data)=>{
    console.log("I come first");
    if(data.length==0)
    {
      console.log("Nothing loaded");
    }
    else
    {
      console.log(data.length);
        response.render("profileList",{layout:false, results: data});
    }
  })

});

//Suggested search route that executes view 3
app.get('/hardestWorker',checkToken,(req,res)=>{
  sql.query("SELECT * FROM VIEW3",(err,data)=>{
    res.render("profileList",{layout:false, results: data});
  })
})
//Suggested search route that executes view 5
app.get('/specificCompany',checkToken,(req,res)=>{
  sql.query("SELECT * FROM VIEW5",(err,data)=>{
    res.render("profileList",{layout:false, results: data});
  })
})
//Suggested search route that executes view 7
app.get('/developer',checkToken,(req,res)=>{
  sql.query("SELECT * FROM VIEW7",(err,data)=>{
    res.render("profileList",{layout:false, results: data});
  })
})
//Suggested search route that executes view 10
app.get('/jutr',checkToken,(req,res)=>{
  sql.query("SELECT * FROM VIEW10",(err,data)=>{
    res.render("profileList",{layout:false, results: data});
  })
})
//Viewing other persons profile route following similar logic from above
app.post('/viewProfile',checkToken,(req,res)=>{
  let names = new Array();
  console.log("PROFILE ID FROM PROFILES: "+req.body.profile_ID)
  sql.query("SELECT * FROM Profile WHERE ProfileID =?",req.body.profile_ID, (err, data)=>{
    console.log("Step 1"+data);
    sql.query("SELECT * FROM Skills WHERE ProfileID =?",data[0].ProfileID,(errr,dataa)=>{
      if(dataa.length<1){
        res.render("otherProfile",{layout:false,profile: data});
      }
      else {
        console.log("Step 2"+dataa[0].Skill);
        sql.query("SELECT * FROM EducationExperience WHERE ProfileID =?",data[0].ProfileID, (errrr,dataaa)=>{
          if(dataaa.length<1)
          {
            res.render("otherProfile",{layout:false,profile: data, skills:dataa});
          }
          else {
            console.log("Step 3"+dataaa);
            sql.query("SELECT * FROM WorkExperience WHERE ProfileID =?",data[0].ProfileID, (errrrr,dataaaa)=>{
              if(dataaaa.length<1)
              {
                res.render("otherProfile",{layout:false,profile: data, skills:dataa,eduexp:dataaa});
              }
              else {
                console.log("Step 4"+dataaaa);
                var foreachPromise1 = new Promise((resolve,reject)=>{
                  dataaaa.forEach((item,idx) => {
                    sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.CompanyID, (error, dataaaaa)=>{
                    names.push(dataaaaa[0].Name);

                    console.log("I should show names "+names);
                    console.log(names[0]);
                    if(idx===dataaaa.length-1)resolve();
                    })
                  });

                });
                foreachPromise1.then(()=>{
                  console.log("Step 5"+names);
                    console.log("Step 6");
                    res.render("otherProfile",{layout:false,profile: data, skills:dataa,eduexp:dataaa,workexp:dataaaa,companyNames:names});
                })
              }


            })
          }

        })
      }

    })
  });
})

//Job Listing page route
app.get('/JobListing', checkToken , (request, response)=> {
  sql.query("SELECT * FROM JobListing",(err,data)=>{
    console.log("I come first");
    let names = new Array();
    if(data.length==0)
    {
      console.log("Nothing loaded");
    }
    else
    {
    var foreachPromise = new Promise((resolve,reject)=>{
      data.forEach((item,idx) => {
        sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
        names.push(dataa[0].Name);

        console.log("I should show names "+names);
        console.log(names[0]);
        if(idx===data.length-1)resolve();
        })
      });

    });

    foreachPromise.then(()=>{
      console.log("I should work" + names[0]);
      response.render("Jobs",{layout:false,companyNames: names, results: data});
    });
    }
  })
});

//Apply button route
app.post('/apply',checkToken,(req,res)=>{
  //getting company name and position being applied for
  let params = req.body.companyName.split('^');
  var companyName = params[0];
  var position = params[1];
  var username = jwt.decode(req.cookies.user).Username;
  //querying db for the email of the company
  sql.query("SELECT Email FROM Company WHERE Name=?",companyName,(err, data) =>
  {
    var recipientEmail = data[0].Email;
    //querying db for users information who is applying
    sql.query("SELECT * FROM Profile WHERE Username=?",username,(error,dataa)=>{
      var name=dataa[0].FirstName + " " + dataa[0].LastName;
      //using external Restful API to send a mail using the information queried
      mailer(recipientEmail,name,position,companyName);
      //Rending back to job listing with success message
      res.render("Jobs",{layout:false,successmessage:"Application sent!"})
    })
  }
  )
})
//Mailer function that utilizes sendgrid external api
function mailer(recipientEmail, name, position, company)
{
  //JSON object passed by the api
  const msg = {
    to: recipientEmail, // Change to your recipient (user email)
    from: 'hijayash@gmail.com', // Change to your verified sender
    subject: 'Job Application For '+position, // (say job position)
    text: 'Hi my name is '+ name + ', and I am interested for the '+position+ ' position at '+company+"." // (put defualt message)
  }
  //Sending email
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
}

//Suggested search route that executes view 6
app.get('/firstJob',checkToken,(req,res)=>{
  sql.query("SELECT * FROM VIEW6",(err,data)=>{
    let names = new Array();
    var foreachPromise = new Promise((resolve,reject)=>{
      data.forEach((item,idx) => {
        //Getting company name for each joblisting found
        sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
        names.push(dataa[0].Name);

        console.log("I should show names "+names);
        console.log(names[0]);
        if(idx===data.length-1)resolve();
        })
      });

    });
    foreachPromise.then(()=>{
      console.log("I should work" + names[0]);
      res.render("Jobs",{layout:false,companyNames: names, results: data});
    });
  })
})
//Suggested search route that executes view 2
app.get('/aboveAverage',checkToken,(req,res)=>{
  sql.query("SELECT * FROM VIEW2",(err,data)=>{
    let names = new Array();
    var foreachPromise = new Promise((resolve,reject)=>{
      data.forEach((item,idx) => {
        //Getting company name for each joblisting found
        sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
        names.push(dataa[0].Name);

        console.log("I should show names "+names);
        console.log(names[0]);
        if(idx===data.length-1)resolve();
        })
      });

    });
    foreachPromise.then(()=>{
      console.log("I should work" + names[0]);
      res.render("Jobs",{layout:false,companyNames: names, results: data});
    });
  })
})
//Route for the job lsiting custom searching
app.post('/JobListing',checkToken,(req,res)=>{
  //Searching by company name, the rest of this function follows the general logic as this first if statement
  if(req.body.query=='CompanyName')
  {
    sql.query("SELECT CompanyID, Name FROM Company WHERE Name LIKE '%" +req.body.searchQuery+ "%'",(err,data)=>{
      if(data.length<1)
      {
        console.log("Company doesnt exist");
      }
      else
      {
        var compID=data[0].CompanyID;
        var name=data[0].Name;
        let names=new Array();
        //Type of work radio button handling
        if(req.body.typeOfWork=='showAll')
        {
          //Querying db ignoring typeofwork
          sql.query("SELECT * FROM JobListing WHERE JobListing.companyid="+data[0].CompanyID,(err,dataa)=>{
          for(var i=0;i<dataa.length;i++)
          {
            names.push(name);
          }
          res.render("Jobs",{layout:false,companyNames:names, results:dataa});
        })
        }
        else
        {
          //Querying db taking into account the type of work option
          sql.query("SELECT * FROM JobListing WHERE JobListing.companyid="+data[0].CompanyID+" AND JobListing.EmploymentType='"+req.body.typeOfWork+"'",(err,dataa)=>{
            for(var i=0;i<dataa.length;i++)
            {
              names.push(name);
            }
            res.render("Jobs",{layout:false,companyNames:names, results:dataa});
          })
        }
      }
    })
  }
  //Searching by pay range
  else if(req.body.query=='PayRange')
  {
    let names=new Array();
    if(req.body.typeOfWork=='showAll')
    {
      sql.query("SELECT * FROM JobListing WHERE PayRange>=?",req.body.searchQuery,(err,data)=>{
        if(data.length<1)
        {
          console.log("No results available!");
          res.render("Jobs",{layout:false,message:'No job listings with those requirements!!'})
        }
        else {
          var foreachPromise = new Promise((resolve,reject)=>{
            data.forEach((item,idx) => {
              sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
              names.push(dataa[0].Name);
              if(idx===data.length-1)resolve();
              })
            });
          });
          foreachPromise.then(()=>{
          res.render("Jobs",{layout:false,companyNames:names, results:data});
          })
        }
      })
    }
    else
    {
      sql.query("SELECT * FROM JobListing WHERE PayRange>=? AND EmploymentType=?",[req.body.searchQuery,req.body.typeOfWork],(err,data)=>{
        if(data.length<1)
        {
          console.log("No results available!");
          res.render("Jobs",{layout:false,message:'No job listings with those requirements!!'})
        }
        else
        {
        var foreachPromise = new Promise((resolve,reject)=>{
          data.forEach((item,idx) => {
            sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
            names.push(dataa[0].Name);
            if(idx===data.length-1)resolve();
            })
          });
        });
        foreachPromise.then(()=>{
        res.render("Jobs",{layout:false,companyNames:names, results:data});
        })
      }
    })}
  }
  else if(req.body.query=='SkillRequirements')
  {
    let names=new Array();
    if(req.body.typeOfWork=='showAll')
    {
      sql.query("SELECT * FROM JobListing WHERE SkillRequirements LIKE '%"+req.body.searchQuery+"%'",(err,data)=>{
        if(data.length<1)
        {
          console.log("No results available!");
          res.render("Jobs",{layout:false,message:'No job listings with those requirements!!'})
        }
        else {
          var foreachPromise = new Promise((resolve,reject)=>{
            data.forEach((item,idx) => {
              sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
              names.push(dataa[0].Name);
              if(idx===data.length-1)resolve();
              })
            });
          });
          foreachPromise.then(()=>{
          res.render("Jobs",{layout:false,companyNames:names, results:data});
          })
        }
      })
    }
    else
    {
      sql.query("SELECT * FROM JobListing WHERE SkillRequirements=? AND EmploymentType LIKE '%"+req.body.searchQuery+"%'",req.body.typeOfWork,(err,data)=>{
        if(data.length<1)
        {
          console.log("No results available!");
          res.render("Jobs",{layout:false,message:'No job listings with those requirements!!'})
        }
        else
        {
        var foreachPromise = new Promise((resolve,reject)=>{
          data.forEach((item,idx) => {
            sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
            names.push(dataa[0].Name);
            if(idx===data.length-1)resolve();
            })
          });
        });
        foreachPromise.then(()=>{
        res.render("Jobs",{layout:false,companyNames:names, results:data});
        })
        }
      })
    }
  }
  else if(req.body.query=='ExperienceRequirements')
  {
    let names=new Array();
    if(req.body.typeOfWork=='showAll')
    {
      sql.query("SELECT * FROM JobListing WHERE ExperienceRequirements LIKE '%"+req.body.searchQuery+"%'",(err,data)=>{
        if(data.length<1)
        {
          console.log("No results available!");
          res.render("Jobs",{layout:false,message:'No job listings with those requirements!!'})
        }
        else {
          var foreachPromise = new Promise((resolve,reject)=>{
            data.forEach((item,idx) => {
              sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
              names.push(dataa[0].Name);
              if(idx===data.length-1)resolve();
              })
            });
          });
          foreachPromise.then(()=>{
          res.render("Jobs",{layout:false,companyNames:names, results:data});
          })
        }
      })
    }
    else
    {
      sql.query("SELECT * FROM JobListing WHERE ExperienceRequirements=? AND EmploymentType LIKE '%"+req.body.searchQuery+"%'",req.body.typeOfWork,(err,data)=>{
        if(data.length<1)
        {
          console.log("No results available!");
          res.render("Jobs",{layout:false,message:'No job listings with those requirements!!'})
        }
        else
        {
        var foreachPromise = new Promise((resolve,reject)=>{
          data.forEach((item,idx) => {
            sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
            names.push(dataa[0].Name);
            if(idx===data.length-1)resolve();
            })
          });
        });
        foreachPromise.then(()=>{
        res.render("Jobs",{layout:false,companyNames:names, results:data});
        })
        }
      })
    }
  }
  else if(req.body.query=='EducationRequirements')
  {
    let names=new Array();
    if(req.body.typeOfWork=='showAll')
    {
      sql.query("SELECT * FROM JobListing WHERE EducationRequirements LIKE '%"+req.body.searchQuery+"%'",(err,data)=>{
        if(data.length<1)
        {
          console.log("No results available!");
          res.render("Jobs",{layout:false,message:'No job listings with those requirements!!'})
        }
        else {
          var foreachPromise = new Promise((resolve,reject)=>{
            data.forEach((item,idx) => {
              sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
              names.push(dataa[0].Name);
              if(idx===data.length-1)resolve();
              })
            });
          });
          foreachPromise.then(()=>{
          res.render("Jobs",{layout:false,companyNames:names, results:data});
          })
        }
      })
    }
    else
    {
      sql.query("SELECT * FROM JobListing WHERE EducationRequirements=? AND EmploymentType LIKE '%"+req.body.searchQuery+"%'",req.body.typeOfWork,(err,data)=>{
        if(data.length<1)
        {
          console.log("No results available!");
          res.render("Jobs",{layout:false,message:'No job listings with those requirements!!'})
        }
        else
        {
        var foreachPromise = new Promise((resolve,reject)=>{
          data.forEach((item,idx) => {
            sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
            names.push(dataa[0].Name);
            if(idx===data.length-1)resolve();
            })
          });
        });
        foreachPromise.then(()=>{
        res.render("Jobs",{layout:false,companyNames:names, results:data});
        })
        }
      })
    }
  }
  else if(req.body.query=='blank')
  {
    let names=new Array();
    if(req.body.typeOfWork=='showAll')
    {
      res.redirect("/JobListing");
    }
    else {
      sql.query("SELECT * FROM JobListing WHERE EmploymentType='"+req.body.typeOfWork+"'",(err,data)=>{
        var foreachPromise = new Promise((resolve,reject)=>{
          data.forEach((item,idx) => {
            sql.query("SELECT Name FROM Company WHERE CompanyID =?",item.companyid, (error, dataa)=>{
            names.push(dataa[0].Name);
            if(idx===data.length-1)resolve();
            })
          });
        });
        foreachPromise.then(()=>{
        res.render("Jobs",{layout:false,companyNames:names, results:data});
      })
      })
    }

  }
})

//Route for custom searching on company listing page, follows the same logic as above adjusted for company
app.post('/CompanyListing',checkToken,(req,res)=>
{
  if(req.body.query=='Name')
  {
    sql.query("SELECT * FROM Company WHERE Name LIKE '%"+req.body.searchQuery+"%'",(err,data)=>{
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("Companys",{layout:false, message:'No companies that look like that!!'})
      }
      else
      {
        res.render("Companys",{layout:false, results:data});
      }
    })
  }
  else if(req.body.query=='Description')
  {
    sql.query("SELECT * FROM Company WHERE Description LIKE '%"+req.body.searchQuery+"%'",(err,data)=>{
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("Companys",{layout:false, message:'No companies that look like that!!'})
      }
      else
      {
        res.render("Companys",{layout:false, results:data});
      }
    })
  }
  else if(req.body.query=='blank')
  {
    res.redirect("/Companys");
  }
})

//Route for custom searching on profile listing pages, following same logic as above
app.post('/profileListing',checkToken,(req,res)=>
{
  console.log("Step 1")
  if(req.body.query=='Skill')
  {
    console.log("Step 2")
    sql.query("SELECT * FROM Profile WHERE ProfileID= ANY (SELECT ProfileID FROM Skills WHERE Skill LIKE '%"+req.body.searchQuery+"%')",(err,data)=>{
      console.log("Step 3")
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("profileList",{layout:false, message:'No matching profiles!!'})
      }
      else
      {
        res.render("profileList",{layout:false, results: data});
      }
    })
  }
  else if(req.body.query=='Degree')
  {
    sql.query("SELECT * FROM Profile WHERE ProfileID= ANY (SELECT ProfileID FROM EducationExperience WHERE Degree LIKE '%"+req.body.searchQuery+"%')",(err,data)=>{
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("profileList",{layout:false, message:'No matching profiles!!'})
      }
      else
      {
        res.render("profileList",{layout:false, results: data});
      }
    })
  }
  else if(req.body.query=='School')
  {
    sql.query("SELECT * FROM Profile WHERE ProfileID= ANY (SELECT ProfileID FROM EducationExperience WHERE School LIKE '%"+req.body.searchQuery+"%')",(err,data)=>{
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("profileList",{layout:false, message:'No matching profiles!!'})
      }
      else
      {
        res.render("profileList",{layout:false, results: data});
      }
    })
  }
  else if(req.body.query=='Achievements')
  {
    sql.query("SELECT * FROM Profile WHERE ProfileID= ANY (SELECT ProfileID FROM EducationExperience WHERE Achievements LIKE '%"+req.body.searchQuery+"%')",(err,data)=>{
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("profileList",{layout:false, message:'No matching profiles!!'})
      }
      else
      {
        res.render("profileList",{layout:false, results: data});
      }
    })
  }
  else if(req.body.query=='YearStarted')
  {
    sql.query("SELECT * FROM Profile WHERE ProfileID= ANY (SELECT ProfileID FROM EducationExperience WHERE YearStarted="+req.body.searchQuery+")",(err,data)=>{
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("profileList",{layout:false, message:'No matching profiles!!'})
      }
      else
      {
        res.render("profileList",{layout:false, results: data});
      }
    })
  }
  else if(req.body.query=='YearFinished')
  {
    sql.query("SELECT * FROM Profile WHERE ProfileID= ANY (SELECT ProfileID FROM EducationExperience WHERE YearFinished="+req.body.searchQuery+")",(err,data)=>{
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("profileList",{layout:false, message:'No matching profiles!!'})
      }
      else
      {
        res.render("profileList",{layout:false, results: data});
      }
    })
  }
  else if(req.body.query=='DescriptionOfWork')
  {
    sql.query("SELECT * FROM Profile WHERE ProfileID= ANY (SELECT ProfileID FROM WorkExperience WHERE DescriptionOfWork LIKE '%"+req.body.searchQuery+"%')",(err,data)=>{
      if(data.length<1)
      {
        console.log("No results available!");
        res.render("profileList",{layout:false, message:'No matching profiles!!'})
      }
      else
      {
        res.render("profileList",{layout:false, results: data});
      }
    })
  }
  else if(req.body.query=='blank')
  {
    res.redirect("/profileList");
  }
})
//Logout route
app.get('/Logout',(req,res)=>{
  res.clearCookie('user',{maxAge:3600000,httpOnly:true})
  res.render("login",{layout:false,message:'Logout Successful!'})

})
// Starting server
server.listen(3000, () => {
  console.log("Server is running on port 3000.");
});

//functions
function checkToken(req, res, next) //verifies the route token
{
  const authCookie = req.cookies.user;

  jwt.verify(authCookie,jwtConfig.JWTPASSWORD, (err, data)=>{
    if(err)
    {
      res.render('login', {failureMessage:'You must be logged in to access that'})
    }
    else if (data.Username) {
      req.Username=data.Username;
      next();
    }
  })
}
