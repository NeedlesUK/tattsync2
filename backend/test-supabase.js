require("dotenv").config();
const { supabase } = require("./config/database");

async function test() {
  if (!supabase) {
    console.log("No Supabase client!");
    return;
  }
  
  // Try to query something simple
  const { data, error } = await supabase.from("users").select("*").limit(1);
  
  if (error) {
    console.log("Query error:", error.message);
  } else {
    console.log("Query successful! Data:", data);
  }
}

test();
