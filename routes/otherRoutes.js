// otherRoutes.js

const router = require("express").Router();
const { userCommandToAnalyze } = require("../config/nluAnalysis");
const { google } = require("googleapis");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

router.post("/analyse-text", isAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;

    const analyzedText = await userCommandToAnalyze(text);

    const eventDetails = analyzedText.eventDetails;
    const operation = analyzedText.operation;

    console.log("Event details: ", eventDetails);
    console.log("Operation: ", operation);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: req.user.accessToken,
    });

    const calendar = await google.calendar({
      version: "v3",
      auth: auth,
    });

    if (operation === "create") {
      const result = await calendar.events.insert({
        calendarId: "primary",
        resource: eventDetails,
      });

      console.log("Event details: ", result.data);
      console.log("Event HTML link: ", result.data.htmlLink);
      return res.status(200).json({
        eventId: result.data.id,    
        summary: result.data.summary,
        htmlLink: result.data.htmlLink,
      });
    } else if (operation === "delete") {
      // event id getting

      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
      });
    }
  } catch (error) {
    console.error("Error during API request:", error);
    return res.status(500).send("Error processing request");
  }
});

router.get("/", isAuthenticated, (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;
