const express = require("express");
const bodyParser = require("body-parser");
var timeout = require('connect-timeout');

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit:500000, timedout:1000 }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS" 
  );
  next();
});

app.use(timeout('1000s'));

app.use("/map", require("./routes/map"));

app.listen(3000);

console.log("listen on 3000");

module.exports = app;
