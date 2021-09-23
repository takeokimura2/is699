//add packages
require('dotenv').config()

// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const getTotalRecords = () => {
  sql = "SELECT COUNT(*) FROM product";
  return pool.query(sql)
      .then(result => {
          return {
              msg: "success",
              totRecords: result.rows[0].count
          }
      })
      .catch(err => {
          return {
              msg: `Error: ${err.message}`
          }
      });
};

module.exports.getTotalRecords = getTotalRecords;