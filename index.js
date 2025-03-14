const bodyParser = require("body-parser");
const express = require("express");
const app = express();
uuid = require("uuid");
morgan = require("morgan");
require("dotenv").config();

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

const cors = require("cors");
app.use(cors());
const { check, validationResult } = require("express-validator");

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//mongoose.connect("mongodb://localhost:27017/cfDB", { useNewUrlParser: true,useUnifiedTopology: true,});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

let auth = require("./auth")(app);
const jwt = require("jsonwebtoken");
const passport = require("passport");

require("./passport");

// Morgan middleware library to log all requests
app.use(morgan("common"));

/**
 * @route POST /users
 * @description Register a new user.
 * @access Public
 * @body {Object} user - User registration details
 * @bodyParam {string} Username - Username of the new user
 * @bodyParam {string} Password - Password for the new user
 * @bodyParam {string} Email - Email address of the new user
 * @bodyParam {string} Birthday - Birthday of the new user (optional)
 * @returns {Object} Newly registered user
 * @returns {string} Error message if the user already exists or if there is a server error
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * @route GET /users
 * @description Allow new users to register
 * @access Private (requires JWT authentication)
 * @returns {Array<Object>} List of users
 * @returns {string} Error message if there is a server error
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route GET /users/:Username
 * @description Gets a user by their username.
 * @access Private (requires JWT authentication)
 * @param {string} Username.path.required - The username of the user to retrieve.
 * @returns {Object} User object if found
 * @returns {string} Error message if user is not found or there is a server error
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route PUT /users/:Username
 * @description Update a user's details by their username.
 * @access Private (requires JWT authentication)
 * @param {string} Username.path.required - The username of the user to update.
 * @body {Object} user - User details to update
 * @bodyParam {string} Username - New username for the user
 * @bodyParam {string} Password - New password for the user
 * @bodyParam {string} Email - New email address for the user
 * @bodyParam {string} Birthday - New birthday for the user (optional)
 * @returns {Object} Updated user object
 * @returns {string} Error message if validation fails or there is a server error
 */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route POST /users/:Username/movies/:MovieID
 * @description Allow users to add a movie to their list of favorites
 * @access Private (requires JWT authentication)
 * @param {string} Username.path.required - The username of the user to update.
 * @param {string} MovieID.path.required - The ID of the movie to add to favorites.
 * @returns {Object} Updated user object with the movie added to the favorites
 * @returns {string} Error message if there is a server error
 */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route DELETE /users/:Username/movies/:MovieID
 * @description Remove a movie from a user's list of favorites.
 * @access Private (requires JWT authentication)
 * @param {string} Username.path.required - The username of the user to update.
 * @param {string} MovieID.path.required - The ID of the movie to remove from favorites.
 * @returns {Object} Updated user object with the movie removed from the favorites
 * @returns {string} Error message if there is a server error
 */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route DELETE /users/:Username
 * @description Delete a user by username.
 * @access Private (requires JWT authentication)
 * @param {string} Username.path.required - The username of the user to delete.
 * @returns {string} Success message if the user is deleted
 * @returns {string} Error message if the user is not found or if there is a server error
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route GET /movies
 * @description Return a list of all data concerning the movies to the user
 * @access Private (requires JWT authentication)
 * @returns {Object[]} 200 - An array of movie objects.
 * @returns {string} 500 - Error message if there is a server error.
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route GET /movies/:Title
 * @description return´s data about a single movie by title to the user
 * @access Private (requires JWT authentication)
 * @param {string} Title.path.required - The title of the movie to retrieve.
 * @returns {Object} 200 - Movie object matching the given title.
 * @returns {string} 500 - Error message if there is a server error.
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route GET /movies/genre/:Name
 * @description Return data about a genre by its name/title.
 * @param {string} Name.path.required - The name of the genre to retrieve.
 * @returns {Object} 200 - Genre object including description and other details.
 * @returns {string} 500 - Error message if there is a server error.
 */
app.get("/movies/genre/:Name", async (req, res) => {
  await Movies.findOne({ "Genre.Name": req.params.Name })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * @route GET /movies/directors/:Name
 * @description Return data about a director by their name.
 * @access Private (requires JWT authentication)
 * @param {string} Name.path.required - The name of the director to retrieve.
 * @returns {Object} 200 - The director's details, including bio, birth year, and death year.
 * @returns {string} 500 - Error message if there is a server error.
 */
app.get(
  "/movies/directors/:Name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * @route GET /
 * @description Welcoming message for the FilmSphere API.
 * @returns {string} 200 - A welcome message.
 */

//Welcoming Route
app.get("/", (req, res) => {
  res.send("Welcome to the FilmSphere!");
});

/**
 * @middleware
 * @description Serve static files from the 'public' folder.
 * @static
 * @param {string} folder - The directory from which to serve static files (in this case, 'public').
 */

//Serve static files from the 'public' folder
app.use(express.static("public"));

/**
 * @middleware
 * @description Error handling middleware to catch and log errors, and send a response to the client.
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */

//Error Message
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Oops! Something went wrong. Our team is on it!");
});

/**
 * @description Start the Express server on the specified port.
 * @param {number} port - The port number on which the server will listen. Defaults to 8080 if not provided.
 * @param {string} host - The hostname to bind to. Defaults to "0.0.0.0" to allow connections from any IP address.
 * @returns {void}
 */

//Start the server
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
