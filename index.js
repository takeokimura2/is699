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

// GET /edit/5
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM URANIUM WHERE company_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("edit", { model: result.rows[0] });
  });
});

// POST /edit/5
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const uranium = [
    id, 
    req.body.ticker, 
    req.body.company_name, 
    req.body.headquarter, 
    req.body.market,
    req.body.jurisdiction,
    req.body.stock_price,
    req.body.mining_method,
    req.body.development_stage,
    req.body.resource_quantity,
    req.body.cop,
    req.body.cash,
    req.body.debt,
    req.body.cash_flow,
    req.body.net_income,
    req.body.website,
    req.body.incorporated ];
  const sql = "UPDATE URANIUM SET ticker = $2, company_name = $3, headquarter = $4, market = $5, jurisdiction = $6, stock_price = $7, mining_method = $8, development_stage = $9, resource_quantity = $10, cop = $11, cash = $12, debt = $13, cash_flow = $14, net_income = $15, website = $16, incorporated = $17 WHERE (company_id = $1)";

  pool.query(sql, uranium, (err, result) => {
    // if (err) ...
    res.redirect("/uraniumstocks");
  });
});

// GET /create
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

// POST /create
app.post("/create", (req, res) => {
  const sql = "INSERT INTO URANIUM (ticker, company_name, headquarter, market, jurisdiction, stock_price, mining_method, development_stage, resource_quantity, cop, cash, debt, cash_flow, net_income, website, incorporated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)";
  const uranium = [
    req.body.ticker, 
    req.body.company_name, 
    req.body.headquarter, 
    req.body.market,
    req.body.jurisdiction,
    req.body.stock_price,
    req.body.mining_method,
    req.body.development_stage,
    req.body.resource_quantity,
    req.body.cop,
    req.body.cash,
    req.body.debt,
    req.body.cash_flow,
    req.body.net_income,
    req.body.website,
    req.body.incorporated ];

  console.log(uranium);

  pool.query(sql, uranium, (err, result) => {
    // if (err) ...
    console.log(err)
    res.redirect("/uraniumstocks");
  });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM URANIUM WHERE company_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("delete", { model: result.rows[0] });
  });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM URANIUM WHERE company_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.redirect("/uraniumstocks");
  });
});