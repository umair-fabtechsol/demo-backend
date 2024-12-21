const cors = require("cors");
const express = require("express");

const dotenv = require("dotenv").config();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const bodyParser = require("body-parser");
// require("./cron")

module.exports = function (app) {
  // function verifyStripeSignature(req, res, buf, encoding) {
  //   req.rawBody = buf.toString(encoding);
  // }
  app.use(cors());
  app.options("*", cors());
  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(cookieParser());

  app.use(xss());
  app.use(compression());

  app.use(express.json({ limit: "30mb" }));
  app.use(bodyParser.json());
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use(mongoSanitize());
  const limiter = rateLimit({
    max: 90000,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many requests from this IP, please try again in 15 mintues!",
  });
  app.use("/api", limiter);

  app.set("view engine", "ejs");

  // Prevent parameter pollution
  app.use(
    hpp({
      whitelist: [],
    })
  );
  // Test middleware
  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
  });
};
