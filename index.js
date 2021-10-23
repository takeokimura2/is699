// Add required packages
const express = require("express");
const app = express();
const dblib = require("./dblib.js");
const multer = require("multer");
const upload = multer();
const axios = require("axios")

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
    const companyName = [];
    if(err) {
        message = `Error - ${err.message}`;
    } else {
        message = "success";
        model = result.rows;
        for (const record of model ){
          companyName.push(record.company_name)
        }
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

// GET /news/
app.get("/news/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM URANIUM WHERE company_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("news", {
      type: "get",
       model: result.rows[0] });
  });
});


// POST /news/
app.post("/news/:id", async (req, res) => {
  console.log(req.body)

  searchValue = req.body.search_value;

  console.log(searchValue)

  var API_Key = "AIzaSyCalm5-PsQ0oD_RaH8quDuEEAXUoghG85s"

  var videos =[]

  const baseApiUrl = "https://www.googleapis.com/youtube/v3/search?key="
  const url=`${baseApiUrl}${API_Key}&type=video&part=snippet&maxResults=10&q=${searchValue}`
  console.log(url)

  const response = await axios.get(url)
  //console.log("response", response.data.items)
  const searchResult = response.data.items
  console.log(searchResult)

  searchResult.forEach(item => {
    //video = item.id.videoId
    videos.push(item)

  })


  const id = req.params.id;
  const sql = "SELECT * FROM URANIUM WHERE company_id = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("news", {
      model: result.rows[0], 
      type: "post",
      videos: videos 
     })
  });
  
});

//Setup routes to uranium stock analysis
app.get("/uraniumstockanalysis", (req, res) => {
  const sql = "SELECT * FROM URANIUM ORDER BY company_name";
  pool.query(sql, [], (err, result) => {
    var message = "";
    var models = {};
    const companyName = [];
    const resourceQuantity = [];
    if(err) {
        message = `Error - ${err.message}`;
    } else {
        message = "success";
        models = result.rows;
        for (const model of models ){
          companyName.push(model.company_name)
          resourceQuantity.push(Number(model.resource_quantity))
        }
    };
    res.render("uraniumstockanalysis", {
        message: message,
        model : models,
        companyName: companyName,
        resourceQuantity: resourceQuantity
    });

  });
});

//Setup routes to chart js
app.get("/uraniumstockanalysis_test", (req, res) => {
  const sql = "SELECT * FROM URANIUM ORDER BY company_name";

  function getData(models) {
    const companyName = [];
    const resourceQuantity = [];

    for (const model of models ){
      companyName.push(model.company_name)
      resourceQuantity.push(Number(model.resource_quantity))
    }
    return {companyName, resourceQuantity};
  }

  async function chartIt(models){

    chartData = await getData(models);

    //console.log(chartData.companyName)
    //console.log(chartData.resourceQuantity)

    const data = {
      labels: chartData.companyName,
      datasets: [{
      label: 'Resource Quantity',
      backgroundColor: 'rgba(0, 99, 255, 0.2)',
      borderColor: 'rgba(0, 0, 255, 1.0)',
      borderWidth: 1,
      hoverBackgroundColor: 'pink',
      hoverBorderColor: 5,
      fill: 'start',
      data: chartData.resourceQuantity,
      }
      ]
    };

    const config = {
      type: 'bar',
      data: data,
      options: {}
    };

    //console.log(config)
    //console.log(config.data)
    //console.log(config.data.datasets)

    return config;
    
  }



  pool.query(sql, [], (err, result) => {
    var message = "";
    var models = {};

    if(err) {
        message = `Error - ${err.message}`;
    } else {
        message = "success";
        models = result.rows;

        charts = chartIt(models);
        

    };
    res.render("uraniumstockanalysis_test", {
        message: message,
        model: models,
        chart: charts
        
    });

  });
});