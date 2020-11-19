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

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//External route files
require("./routes/userRoutes.js")(app);
require("./routes/profileRoutes.js")(app);


//View Engine - handlebars
app.set('view engine', 'hbs');


//Internal routes
app.get('/', function(request, response) {
  response.render("index");
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
