const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Sri@2546",
  database: "agroot"
});

db.connect((err) => {
  if (err) {
    console.error("Connection failed:", err);
    return;
  }

  console.log("MySQL Connected!");
});

module.exports = db;
