// otherRoutes.js

const router = require("express").Router();
const { userCommandToAnalyze } = require("../config/nluAnalysis");
const { google } = require("googleapis");
const key = require("../serviceKey.json");

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

    console.log(req.user.accessToken);
    console.log(req.user.refreshToken);

    // const auth = new google.auth.GoogleAuth({
    //   credentials: key,
    //   scopes: [
    //     "profile",
    //     "https://www.googleapis.com/auth/calendar",
    //     "https://www.googleapis.com/auth/calendar.events",
    //   ],
    // });

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: req.user.accessToken,
    })

    // const authClient = await auth.getClient();

    const calendar = await google.calendar({
      version: "v3",
      auth: auth,
    });

    if (operation === "create") {
      const result = await calendar.events.insert({
        calendarId: "primary",
        resource: eventDetails,
      });

      console.log(result.data);
      return res.status(200).send("Event Created Successfully:");
    } else if (operation === "delete") {
      //
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
