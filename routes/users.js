const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "./uploads" });
const User = require("../models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { check, validationResult } = require("express-validator/check");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.get("/register", function (req, res, next) {
  res.render("register", { title: "Register" });
});
router.get("/login", function (req, res, next) {
  res.render("login", { title: "Login" });
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Invalid Credentials",
  }),
  function (req, res) {
    req.flash("success", "You are now logged in");
    res.redirect("/");
  }
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await User.getUserByUsername(username);
    if (!user) {
      return done(null, false, { message: "unknown user" });
    }

    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) return done(err);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid Password" });
      }
    });
  })
);

router.post(
  "/register",
  upload.single("profile"),
  [
    check("name", "Name is empty!! Required").not().isEmpty(),
    check("email", "Email required").not().isEmpty(),
    check("contact", "contact length should be 10")
      .not()
      .isEmpty()
      .isLength({ max: 10 }),
  ],
  async (req, res, next) => {
    let form = {
      person: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      uname: req.body.username,
      pass: req.body.password,
    };
    console.log(form);
    const errr = validationResult(req);
    if (!errr.isEmpty()) {
      console.log(errr);
      res.render("register", { errors: errr.errors, form: form });
    } else {
      let name = req.body.name;
      let email = req.body.email;
      let uname = req.body.username;
      let password = req.body.password;
      let contact = req.body.contact;

      let profileimage = req.file ? req.file.filename : "noimage.jpg";
      let newUser = new User({
        name: name,
        email: email,
        password: password,
        profileimage: profileimage,
        uname: uname,
        contact: contact,
      });
      await User.createUser(newUser);

      res.location("/");
      res.redirect("./login");
    }
  }
);

router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "You are now logged out");
  res.redirect("/users/login");
});

module.exports = router;
