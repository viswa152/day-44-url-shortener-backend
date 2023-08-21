const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const urlRoutes = require("./routes/urlRoutes");
const redirectRoutes = require("./routes/redirectRoutes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>URL-Shortener</h1>");
});

app.use("/users", userRoutes);
app.use("/user/url", urlRoutes);
app.use("/short", redirectRoutes);

module.exports = app;
