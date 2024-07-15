require('dotenv').config();
const user = require('../db/user');
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", async (req, res) => {
  const providedLogin = req.body.login;
  const providedPass = req.body.password;
  const userObj = await user.findUser(providedLogin);
  if (userObj) {
    if (await user.verifyUserLogin(providedLogin, providedPass)) {
    const accessToken = jwt.sign({user : userObj}, process.env.ACCESS_TOKEN_SECRET);
    delete userObj.user_password;
    return res.json({accessToken : accessToken, user : userObj})
    } else {
        return res.json({errorMessage : `Wrong password!`});
    }
  } else {
    return res.json({errorMessage : `User with login ${providedLogin} does not exists`});
  }
});

module.exports = router;