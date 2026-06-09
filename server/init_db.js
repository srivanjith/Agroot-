const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Sri@2546"
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
  connection.query("CREATE DATABASE IF NOT EXISTS agroot", (err, result) => {
    if (err) throw err;
    console.log("Database created or exists");
    
    connection.query("USE agroot", (err) => {
      if (err) throw err;
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100)
        );
      `;
      connection.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log("Table created");
        
        const insertQuery = `
          INSERT INTO users (name, email)
          VALUES
          ('Sri', 'sri@example.com'),
          ('John', 'john@example.com');
        `;
        connection.query(insertQuery, (err, result) => {
          if (err) throw err;
          console.log("Data inserted");
          process.exit(0);
        });
      });
    });
  });
});
