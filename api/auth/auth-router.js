require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const db = require("../users/users-data");

router.post("/register", async (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  const credentials = req.body;
  try {
    if (!credentials.username || !credentials.password) {
      res.status(400).json({ message: "username and password required" });
    } else {
      const rounds = parseInt(process.env.BCRYP_ROUNDS);
      const hash = bcrypt.hashSync(credentials.password, rounds);
      credentials.password = hash;
      const newUser = await db.add(credentials);
      const token = generateToken(newUser);
      res.status(201).json({ data: newUser, token });
    }
  } catch {
    res.status(500).json({ message: "Error" });
  }
});

router.post("/login", async (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      res.status(400).json({ message: "username and password required" });
    } else {
      const user = await db.findBy({ username });
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(201).json({ data: user, token });
      } else {
        res.status(400).json({ message: "invalid credentials" });
      }
    }
  } catch {
    res.status(500).json({ message: "Error" });
  }
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  const token = jwt.sign(payload, secret, options);
  return token;
}

module.exports = router;
