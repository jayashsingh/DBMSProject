const sql = require("./db.js");
var path = require('path');
// constructor
const User = function User(user) {
  this.Username = user.Username;
  this.Password = user.Password;
};

User.create = (newUser, result) => {
  //Check if user exists already

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

module.exports = User;
