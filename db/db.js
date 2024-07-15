const { Pool } = require("pg");
const readline = require("node:readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


const MAX_NUMBER_OF_SONGS_PER_PAGE = 15;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "music_station_db",
  password: "password",
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

function formatQueryInput(str) {
  if(str === "") {
    return "";
  }
  str = str.trim().toLowerCase().replace(/\s+/g, "%");
  str = "%" + str + "%";
  return str;
}

process.on("SIGINT", () => {
  pool.end(() => {
    console.log("Pool has ended");
    process.exit(0);
  });
});

module.exports = { pool, formatQueryInput, MAX_NUMBER_OF_SONGS_PER_PAGE };