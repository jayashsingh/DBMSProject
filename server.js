var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var server = http.Server(app);
const bodyParser = require("body-parser");
const hbs= require("hbs");


// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
// simple route
app.get('/', function(request, response) {
  //response.sendFile(path.join(__dirname, 'login.html'));
  response.render("login");
});

app.get('/register', function(request, response) {
  //response.json({hi: "buasidj", bye: "bekjasd"});
  //response.sendFile(path.join(__dirname, 'register.html'));
  response.render("register",{layout:false});
});

require("./routes/userRoutes.js")(app);
// set port, listen for requests
server.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
