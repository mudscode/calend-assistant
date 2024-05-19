// app.js

const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const https = require("https");
const fs = require("fs");
const passport = require("./config/passportAuth.js");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes.js");
const otherRoutes = require("./routes/otherRoutes.js");

// App
const app = express();

// Load environment variables
dotenv.config();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
const corsOptions = {
  origin: "http://localhost:8080",
  methods: "GET,POST",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Routes Usage
app.use("/auth", authRoutes);
app.use(otherRoutes);

if (process.env.NODE_ENV === "production") {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Http server running on port ${port}`);
  });
} else {
  const credentials = {
    key: fs.readFileSync("./certs/private.key", "utf8"),
    cert: fs.readFileSync("./certs/server.crt", "utf8"),
  };
  const httpsServer = https.createServer(credentials, app);
  const port = process.env.PORT || 3000;
  httpsServer.listen(port, "0.0.0.0", () => {
    console.log(`Listening or port ${port}`);
  });
}
