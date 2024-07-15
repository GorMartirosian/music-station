const express = require("express");
const router = express.Router();
const music = require("../db/music");
const jwt = require("jsonwebtoken");

function authUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token != null) {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.payload = payload;
        console.log(`You passed the auth ${payload.user.login}!!!`);
        next();
      });
    } else {
      return res.send("No token specified!");
    }
  } else {
    return res.send("Authentication header missing in request!");
  }
}
router.use(authUser);

router.get("/", async (req, res) => {
  const user = req.payload.user;
  const savedSongs = await music.findSavedSongs(user.login);
  return res.json(savedSongs);
});

router.post("/", async (req, res) => {
  const musicName = req.body.musicName;
  const userLogin = req.payload.user.login;
  const addToSaved = req.body.addToSaved;
  let altered;
  if (addToSaved) {
    altered = await music.addSongToSaved(musicName, userLogin);
  } else {
    altered = await music.removeSongFromSaved(musicName, userLogin);
  }
  res.json({ altered: altered });
});

module.exports = router;