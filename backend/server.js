const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

require("./src/config/passport");

const app = express();
const frontendOrigin = process.env.FRONTEND_URL || "https://localhost:5173";

// CORS configuration to allow requests from the frontend(Cross Origin )
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);

app.use(express.json());
// Parse URL-encoded form data (from HTML forms) and make it available in req.body
app.use(express.urlencoded({ extended: true }));

// sessions (keeping users logged in)
app.use(
  session({
    secret: process.env.JWT_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());

app.use("/api/auth", require("./src/routes/auth.routes"));

// Test route to verify server is running
app.get("/", (req, res) => {
  res.json({ message: "Jobify API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
