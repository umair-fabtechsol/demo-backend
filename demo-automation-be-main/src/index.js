require("dotenv").config();
const connectDB = require("./configure/connectDb");
const express = require("express");
const configMiddlewares = require("./configure/configMiddlewares");
const routes = require("./configure/routes");

const app = express();

// Use the middlewares
configMiddlewares(app);

// Use the routes
routes(app);
// Connect to the database
connectDB();

