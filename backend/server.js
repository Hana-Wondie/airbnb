const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const saltRounds = 10;

// Create connection (MAMP default settings)
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: 8889,
  password: "root", // MAMP default password
  multipleStatements: true,
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Connection failed:", err);
    return;
  }
  console.log("Connected to MySQL...");

  // Step 1: Create Database and Tables
  const createDBAndTables = `
  CREATE DATABASE IF NOT EXISTS ethiolodge;
  USE ethiolodge;

  CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstname VARCHAR(100) NOT NULL,
      lastname VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS properties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      location VARCHAR(255) NOT NULL,
      image VARCHAR(255),
      price DECIMAL(10,2) NOT NULL,
      number_of_room INT NOT NULL,
      description TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      property_id INT,
      startfrom DATE NOT NULL,
      ends DATE NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );
  `;

  connection.query(createDBAndTables, (err) => {
    if (err) {
      console.error("Error creating database/tables:", err);
      connection.end();
      return;
    }

    console.log("Database and tables created successfully!");

    // Step 2: Hash Password
    const userPassword = "123456";

    bcrypt.hash(userPassword, saltRounds, (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        connection.end();
        return;
      }

      // Step 3: Insert user with hashed password
      const insertUser = `
        INSERT INTO ethiolodge.users (firstname, lastname, email, password)
        VALUES (?, ?, ?, ?)
      `;

      connection.query(
        insertUser,
        ["John", "Doe", "john@example.com", hash],
        (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
          } else {
            console.log("User inserted with hashed password!");
          }

          connection.end();
        },
      );
    });
  });
});
