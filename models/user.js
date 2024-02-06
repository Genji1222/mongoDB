const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose
  .connect("mongodb://localhost:27017/auth-demo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connection Established"))
  .catch((err) => console.log(err));

const db = mongoose.connection;
const userSchema = mongoose.Schema({
  name: {
    type: String,
    index: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  profileimage: {
    type: String,
  },
  uname: {
    type: String,
  },
  contact: {
    type: Number,
  },
});

const User = (module.exports = mongoose.model("user", userSchema));

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.getUserByUsername = async (username) => {
  const query = { uname: username };
  return User.findOne(query);
};

module.exports.comparePassword = function (candidatepassword, hash, callback) {
  bcrypt.compare(candidatepassword, hash, function (err, isMatch) {
    callback(null, isMatch);
  });
};

module.exports.createUser = async (newUser) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newUser.password, salt);

  newUser.password = hash;
  await newUser.save();
  return newUser;
};
