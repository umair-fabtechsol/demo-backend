const axios = require("axios");
const catchAsync = require("../utils/catchAsync");

const ACCESS_TOKEN =
  "eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzMyODU2OTI2LCJqdGkiOiJiM2EzNDEzZS0zNzgzLTQ3YTMtYTE4Yy04ZWVlYzE3Y2Q4MzMiLCJ1c2VyX3V1aWQiOiJiNDZkODBkYS1hMWI0LTQwZDYtYmE0MC0yYWU3MmUwZDBmYzIifQ.tI8BB2k6OliWTIYp_dnTj6nKbbWgW2m0O3Y-0gLw831e9evpP6J_0xQqUlaiyT-EEaSriwh5AZdU6UIiMTCYXg";

const scheduleMeeting = async (req, res) => {
  const { eventTypeURI, startTime, endTime, inviteeEmail, inviteeName } =
    req.body;

  try {
    const payload = {
      start_time: startTime, // ISO 8601 format
      end_time: endTime, // ISO 8601 format
      event_type: eventTypeURI, // Event Type URI from Calendly
      invitees: [
        {
          email: inviteeEmail,
          name: inviteeName,
        },
      ],
      location: {
        type: "zoom_conference", // or google_conference
      },
    };

    const response = await axios.post(
      "https://api.calendly.com",
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`, // Your access token
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      message: "Meeting scheduled successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error scheduling meeting:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to schedule meeting" });
  }
};

// const scheduleMeeting = catchAsync(async (req, res, next) => {
//   const { name, email, date, time } = req.body; // Receive data from frontend

//   // Use Calendly API to create the event
//   try {
//     var options = {
//       method: "POST",
//       url: "https://calendly.com/raheelriaz269/interview",
//       //url: "https://api.calendly.com/invitee_no_shows",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "TPNA4AIEMTEPKKLPEEFHZO63HENQVCYM",
//       },
//       data: {
//         invitee: "riaztalha968269@gmail.com",
//       },
//     };

//     axios
//       .request(options)
//       .then(function (response) {
//         // Handle success response from Calendly
//         res.status(200).json({
//           message: "Meeting scheduled successfully",
//           data: response.data,
//         });
//       })

//       .catch(function (error) {
//         console.error(error);
//       });
//   } catch (error) {
//     console.error("Error scheduling meeting:", error);
//     res.status(500).json({
//       message: "Error scheduling meeting",
//       error: error.response?.data || error.message,
//     });
//   }
// });

const getScheduleMeeting = catchAsync(async (req, res, next) => {
  // Use Calendly API to create the event
  try {
    var options = {
      method: "GET",
      url: "https://api.calendly.com/scheduled_events",
      headers: {
        "Content-Type": "application/json",
        Authorization: "TPNA4AIEMTEPKKLPEEFHZO63HENQVCYM",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    res.status(500).json({
      message: "Error scheduling meeting",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = {
  scheduleMeeting,
  getScheduleMeeting,
};
