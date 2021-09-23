// Add required packages
const express = require("express");
const app = express();
const dblib = require("./dblib.js");
const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Set up EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Application folders
app.use(express.static("public"));

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Setup routes to home page
app.get("/", (req, res) => {
  //res.send("Root resource - Up and running!")
  res.render("index");
});

// Setup routes to uranium page
app.get("/uranium", (req, res) => {
  //res.send("Root resource - Up and running!")
  res.render("uranium");
});

//Setup routes to uranium stock page
app.get("/uraniumstocks", (req, res) => {
  const sql = "SELECT * FROM URANIUM ORDER BY company_name";
  pool.query(sql, [], (err, result) => {
    var message = "";
    var model = {};
    if(err) {
        message = `Error - ${err.message}`;
    } else {
        message = "success";
        model = result.rows;
    };
    res.render("uraniumstocks", {
        message: message,
        model : model
    });
  });
});