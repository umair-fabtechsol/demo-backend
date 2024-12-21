const globalErrorHandler = require("../controllers/errorController");
const dotenv = require("dotenv").config();
const { getAsBool } = require("../utils/helpers");
const AppError = require("../utils/appError");
const colors = require("colors");
const http = require("http");

module.exports = function (app) {
  const server = http.createServer(app);
  app.use("/", (req, res, next) => {
    return res.status(200).json({ message: "Api working..." });
    // if (req.path === "/") {

    //   res.send(`
    //     <!DOCTYPE html>
    //     <html lang="en">
    //       <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>Calendly Widget</title>
    //       </head>
    //       <body>
    //         <div
    //           class="calendly-inline-widget"
    //           data-url="https://calendly.com/raheelriaz269"
    //           style="min-width:320px;height:700px;"
    //         ></div>
    //         <script
    //           type="text/javascript"
    //           src="https://assets.calendly.com/assets/external/widget.js"
    //           async
    //         ></script>
    //       </body>
    //     </html>
    //   `);
    // } else {
    //   next();
    // }
  });

  //   app.all("/*", (req, res, next) => {
  //     next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  //   });

  //   app.use((req, res, next) => {
  //     req.requestTime = new Date().toISOString();
  //     // //console.log(req.cookies);
  //     next();
  //   });
  //   app.use(globalErrorHandler);

  const port = process.env.PORT || 2000;
  server.listen(port, function () {
    // const socketManager = new SocketManager(server)
    // app.set("io", socketManager)
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow
        .bold
    );
  });
};
