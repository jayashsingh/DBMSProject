const sql = require("./db.js");

// constructor
const User = function(user) {
  this.Username = user.Username;
  this.Password = user.Password;
};

User.create = (newCustomer, result) => {
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
