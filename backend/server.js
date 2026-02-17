const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

const saltRounds = 10;

// ========================
// Multer configuration for image uploads
// ========================
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// ========================
// MySQL connection
// ========================
const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 8889, // MAMP default
  user: "root",
  password: "root",
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }

  console.log("Connected to MySQL");

  // Create database and tables if not exists
  const setupSQL = `
    CREATE DATABASE IF NOT EXISTS ethiolodge;
    USE ethiolodge;

    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstname VARCHAR(100) NOT NULL,
      lastname VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('guest','admin') NOT NULL
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

  connection.query(setupSQL, (err) => {
    if (err) {
      console.error("Setup error:", err);
      return;
    }
    console.log("Database & tables ready");
  });
});

// ========================
// SIGNUP
// ========================
app.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const sql =
    "INSERT INTO ethiolodge.users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)";

  connection.query(
    sql,
    [firstname, lastname, email, hashedPassword, role],
    (err) => {
      if (err) return res.status(400).json({ message: "User already exists" });
      res.json({ message: "Signup successful" });
    },
  );
});

// ========================
// LOGIN
// ========================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  connection.query(
    "SELECT * FROM ethiolodge.users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(404).json({ message: "User not found" });

      const user = result[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) return res.status(401).json({ message: "Wrong password" });

      res.json({
        id: user.id,
        firstname: user.firstname,
        role: user.role,
      });
    },
  );
});

// ========================
// GET ALL PROPERTIES
// ========================
app.get("/properties", (req, res) => {
  connection.query(
    "SELECT * FROM ethiolodge.properties ORDER BY id DESC",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    },
  );
});

// ========================
// UPLOAD PROPERTY (admin only) with image
// ========================
app.post("/properties", upload.single("image"), (req, res) => {
  const { location, price, number_of_room, description, userRole } = req.body;

  if (userRole !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can upload properties" });
  }

  const image = req.file ? req.file.filename : "";

  const sql = `
    INSERT INTO ethiolodge.properties
    (location, image, price, number_of_room, description)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [location, image, price, number_of_room, description],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error uploading property", error: err });
      res.json({ message: "Property uploaded successfully" });
    },
  );
});

// ========================
// CREATE BOOKING
// ========================
app.post("/bookings", (req, res) => {
  const { user_id, property_id, startfrom, ends } = req.body;

  const sql = `
    INSERT INTO ethiolodge.bookings
    (user_id, property_id, startfrom, ends)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(sql, [user_id, property_id, startfrom, ends], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Booking created successfully" });
  });
});

// ========================
// START SERVER
// ========================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
