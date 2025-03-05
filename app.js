require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const connectDB = require("./config/database"); // ✅ Database import
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const User = require("./models/user");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const customMware = require("./config/middleware");

require("./config/passport"); // ✅ Passport Config Import
//✅use port
const PORT = process.env.ERS_PORT;

// ✅ Connect Database
connectDB();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressLayouts);

// ✅ Set up view engine
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

// ✅ Mongo Store for Session
app.use(
  session({
    name: "Employee review system",
    secret: process.env.SESSION_SECRET_KEY || "abcd",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100 * 24,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // ✅ Now using `MONGO_URI`
      autoRemove: "disabled",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Middleware to make `req.user` available in views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(flash());
app.use(customMware.setFlash);

// ✅ Use express router
app.use("/", require("./routes"));

app.listen(PORT, (err) => {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }
  console.log(`Server is running on port: ${PORT}`);
});
