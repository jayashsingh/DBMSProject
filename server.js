//Packages
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
const sql = require("./models/db.js")

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


//Internal routes
app.get('/', function(request, response) {
  if(request.cookies.user)
  {
    response.render("Main");
  }
  else {
    response.render("index");
  }
});
app.get('/login', function(request, response) {
  response.render("login");
});
app.get('/register', function(request, response) {
  response.render("register",{layout:false});
});
app.get('/Main', checkToken , (request, response)=> {
  response.render("Main",{layout:false});
});
app.get('/editProfile', checkToken , (request, response)=> {
  response.render("editProfile",{layout:false});
});
app.get('/Profile', checkToken , (request, response)=> {
  response.render("Profile",{layout:false, username:request.cookies.user.Username});
});
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
      res.render('login', {failureMessage:'You must be logged in to access that, whore!'})
    }
    else if (data.Username) {
      req.Username=data.Username;
      next();
    }
  })
}
