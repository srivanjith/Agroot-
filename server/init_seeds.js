const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Sri@2546",
  database: "agroot"
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS seeds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        season VARCHAR(50),
        description TEXT,
        price DECIMAL(10, 2),
        image VARCHAR(255),
        ownerId VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  connection.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Seeds table created");
    process.exit(0);
  });
});
