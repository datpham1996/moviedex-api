const express = require("express");
const morgan = require("morgan");
const MOVIEDEX = require("./movies-data-small.json");
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");

const app = express();

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get("Authorization");
  const apiToken = process.env.API_TOKEN;

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
});
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error: { message: "server error" } };
  }
  res.status(500).json(response);

  next();
});

function handleGetReq(req, res) {
  const { genre } = req.query;
  const { country } = req.query;
  const { avg_vote } = req.query;

  let results = MOVIEDEX;

  if (genre) {
    if (genre.match(/[0-9]/g)) {
      return res.status(400).send("The genre must be only letters.");
    }
  }
  if (country) {
    if (country.match(/[0-9]/g)) {
      return res.status(400).send("The country name must be only letters.");
    }
  }
  if (avg_vote) {
    const number = parseInt(avg_vote, 10);
    if (!Number.isInteger(number)) {
      return res.status(400).send("The average vote must be a number.");
    }
  }

  const searchResults = () => {
    if (genre) {
      results = results.filter(
        (movie) => movie.genre.toLowerCase() === genre.toLowerCase()
      );
    }
    if (country) {
      results = results.filter(
        (movie) => movie.country.toLowerCase() === country.toLowerCase()
      );
    }
    if (avg_vote) {
      const number = parseInt(avg_vote, 10);
      results = results.filter((movie) => movie.avg_vote >= number);
    }
    return results;
  };
  res.json(searchResults()).send();
}

app.get("/movie", handleGetReq);

module.exports = app;