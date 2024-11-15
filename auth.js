const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport");

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/* POST login. */
module.exports = (router) => {
  router.post("/login", (req, res) => {
    console.log("Login request received:", req.body);
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error) {
        console.error("Authentication error:", error);
        return res
          .status(500)
          .json({ message: "Authentication error", error: error.message });
      }
      if (!user) {
        console.log("Authentication failed:", info.message);
        return res.status(401).json({ message: info.message });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          console.error("Login error:", error);
          return res
            .status(500)
            .json({ message: "Login error", error: error.message });
        }
        let token = generateJWTToken(user.toJSON());
        console.log(
          "Login successful, token generated for user:",
          user.Username
        );
        return res.json({ user, token });
      });
    })(req, res);
  });
};
