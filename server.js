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

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'hbs');
// simple route
app.get('/', function(request, response) {
  //response.sendFile(path.join(__dirname, 'login.html'));
  response.render("index");
});
app.get('/login', function(request, response) {
  response.render("login");
});
app.get('/register', function(request, response) {
  //response.json({hi: "buasidj", bye: "bekjasd"});
  //response.sendFile(path.join(__dirname, 'register.html'));
  response.render("register",{layout:false});
});

app.get('/Main', checkToken , (request, response)=> {
  response.render("Main",{layout:false});
});

require("./routes/userRoutes.js")(app);
// set port, listen for requests
server.listen(3000, () => {
  console.log("Server is running on port 3000.");
});


function checkToken(req, res, next)
{
  console.log("This is supposed to be logged to verify cookies" + req.cookies.user);
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
