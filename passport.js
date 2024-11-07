const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Log in user
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    async (username, password, callback) => {
      console.log("Login attempt for username:", username);
      try {
        const user = await Users.findOne({ Username: username });
        if (!user) {
          console.log("User not found:", username);
          return callback(null, false, { message: "Incorrect username." });
        }
        if (!user.validatePassword(password)) {
          console.log("Incorrect password for user:", username);
          return callback(null, false, { message: "Incorrect password." });
        }
        console.log("Login successful for user:", username);
        return callback(null, user);
      } catch (error) {
        console.error("Error during authentication:", error);
        return callback(error);
      }
    }
  )
);

/**
 * Check Token for any authenticated request
 */

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
