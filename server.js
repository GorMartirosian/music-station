require("dotenv").config();
const express = require("express");
const axios = require("axios");
const server = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const SERVICE_PORT = 3000;
const DOMAIN_NAME = "localhost";

const music = require("./db/music");
const user = require("./db/user");
const composer = require("./db/composer");

server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const loginRouter = require("./routes/login");
server.use("/login", loginRouter);
const musicSearchRouter = require("./routes/search-music");
server.use("/search-music", musicSearchRouter);
const registrationRouter = require("./routes/registration");
server.use("/register", registrationRouter);
const savedMusicRouter = require("./routes/savedMusic");
server.use("/saved", savedMusicRouter);

server.get("/", async (req, res) => {
  res.render("index");
});

server.listen(SERVICE_PORT);