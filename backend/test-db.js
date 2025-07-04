const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => console.log("✅ Connected successfully!"))
  .catch(err => console.error("❌ Connection failed:", err.message))
  .finally(() => client.end());
