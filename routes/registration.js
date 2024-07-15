const user = require("../db/user");
const express = require("express");
const router = express.Router();
const axios = require('axios');

router.get("/register", (req, res) => {
  res.render("registration");
});

router.post("/register", async (req, res) => {
  const { login, password, name, surname, email } = req.body;
  if (login) {
    if (await user.findUser(login)) {
      return res.json({
        errorMessage: `A user with ${login} already exists.`,
      });
    } else if (password) {
      if (await user.createUser(name, surname, login, password, email)) {
        const response = await axios.post(
          `http://${DOMAIN_NAME}:${SERVICE_PORT}/login`,
          {
            login: login,
            password: password,
          }
        );
        const accessToken = response.data.accessToken;
        const user = response.data.user;
        return res.json({ accessToken: accessToken, user: user });
      }
      return res.json({
        errorMessage: "Error while creating user!",
      });
    } else {
      return res.json({
        errorMessage: `Please provide password.`,
      });
    }
  } else {
    res.status(400).json({ errorMessage: "Login and password are required." });
  }
});

module.exports = router;