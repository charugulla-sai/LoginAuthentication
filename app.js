require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// const bcrypt = require("bcrypt");
// const saltRounds = 10;

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    res.send(err);
  });
  res.redirect("/");
});

app.post("/register", (req, res) => {
  // const newEmail = req.body.username;
  // const newPassword = req.body.password;
  // bcrypt.hash(newPassword, saltRounds, function (err, hash) {
  //   const newUser = new User({
  //     email: newEmail,
  //     password: hash,
  //   });
  //   newUser.save((err) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.render("secrets");
  //     }
  //   });
  // });

  const newEmail = req.body.username;
  const newPassword = req.body.password;
  User.register(
    { username: newEmail },
    newPassword,
    (err, newRegisteredUser) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  // const username = req.body.username;
  // const password = req.body.password;
  // User.findOne({ email: username }, (err, body) => {
  //   if (err) {
  //     res.send(err);
  //   } else if (body) {
  //     bcrypt.compare(password, body.password, function (err, result) {
  //       if (result === true) {
  //         res.render("secrets");
  //       } else {
  //         res.send("Password and email mismatch...!");
  //       }
  //     });
  //   }
  // });

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
