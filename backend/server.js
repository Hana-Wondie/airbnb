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

/* ========================
   Multer config
======================== */

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

/* ========================
   MySQL connection
======================== */

const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 8889,
  user: "root",
  password: "root",
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) return console.error("MySQL connection failed:", err);
  console.log("Connected to MySQL");

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
      description TEXT,
      user_id INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    if (err) return console.error("Setup error:", err);
    console.log("Database & tables ready");
  });
});

/* ========================
   SIGNUP
======================== */

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

/* ========================
   LOGIN
======================== */

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

/* ========================
   GET PROPERTIES
======================== */

app.get("/properties", (req, res) => {
  const sql = `
    SELECT p.*, 
      (SELECT COUNT(*) FROM bookings b WHERE b.property_id = p.id) AS booked
    FROM properties p
    ORDER BY p.id DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ========================
   UPLOAD PROPERTY
======================== */

app.post("/properties", upload.single("image"), (req, res) => {
  const { location, price, number_of_room, description, user_id } = req.body;

  const image = req.file ? req.file.filename : "";

  const sql = `
    INSERT INTO properties 
    (location, image, price, number_of_room, description, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [location, image, price, number_of_room, description, user_id],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error uploading property", error: err });

      res.json({ message: "Property uploaded successfully" });
    },
  );
});

/* ========================
   CREATE BOOKING
======================== */

app.post("/bookings", (req, res) => {
  const { user_id, property_id, startfrom, ends } = req.body;

  const checkSql = `SELECT * FROM bookings WHERE property_id = ?`;

  connection.query(checkSql, [property_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0)
      return res.status(400).json({ message: "Property already booked" });

    const sql = `
      INSERT INTO bookings 
      (user_id, property_id, startfrom, ends)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(sql, [user_id, property_id, startfrom, ends], (err2) => {
      if (err2) return res.status(500).json(err2);
      res.json({ message: "Booking created successfully" });
    });
  });
});

/* ========================
   GET BOOKINGS
======================== */

app.get("/bookings", (req, res) => {
  const sql = `
    SELECT 
      b.id AS booking_id,
      b.property_id,
      u.firstname,
      u.lastname,
      u.email,
      p.user_id,
      b.startfrom,
      b.ends
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    JOIN properties p ON p.id = b.property_id
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* ========================
   DELETE BOOKING
======================== */

app.delete("/bookings/:booking_id", (req, res) => {
  const { booking_id } = req.params;

  connection.query("DELETE FROM bookings WHERE id = ?", [booking_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Booking removed successfully" });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
