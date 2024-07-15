const express = require("express");
const router = express.Router();
const music = require("../db/music");

//gets metadata ONLY
router.get("/", async (req, res) => {
  let musicName = req.query.musicSearchText;
  res.json(await music.findMusicMetadata(musicName));
});

//returns the music file directly
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const resultBytes = await music.getMusicFileById(id);
  if (resultBytes === null) {
    return res.status(404).send("Song not found");
  }
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(resultBytes);
});

module.exports = router;

