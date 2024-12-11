const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let User;

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    const db = mongoose.createConnection("mongodb+srv://sohambhavsar33:o4TcUkKGt9xyQcyS@cluster0.2p1ye.mongodb.net/<users?retryWrites=true&w=majority&tls=true");

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;
          let newUser = new User(userData);
          return newUser.save();
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          if (err.code === 11000) {
            reject("User Name already taken");
          } else {
            reject("There was an error creating the user: " + err);
          }
        });
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .then((user) => {
        if (!user) {
          reject("Unable to find user: " + userData.userName);
        } else {
          bcrypt.compare(userData.password, user.password).then((result) => {
            if (result) {
              user.loginHistory.push({
                dateTime: new Date(),
                userAgent: userData.userAgent,
              });
              User.updateOne(
                { userName: user.userName },
                { $set: { loginHistory: user.loginHistory } }
              )
                .then(() => {
                  resolve(user);
                })
                .catch((err) => {
                  reject("There was an error verifying the user: " + err);
                });
            } else {
              reject("Incorrect Password for user: " + userData.userName);
            }
          });
        }
      })
      .catch(() => {
        reject("Unable to find user: " + userData.userName);
      });
  });
};
