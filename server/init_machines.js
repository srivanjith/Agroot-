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
    CREATE TABLE IF NOT EXISTS machines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        type VARCHAR(50),
        price DECIMAL(10, 2),
        image VARCHAR(255),
        location VARCHAR(100),
        available BOOLEAN DEFAULT TRUE,
        ownerId VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  connection.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Machines table created");
    process.exit(0);
  });
});
