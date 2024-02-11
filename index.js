const express = require("express");
const app = express();
morgan = require("morgan");

let topMovies = [
  {
    title: "Star Wars",
    Director: "George Lucas",
  },

  {
    title: "The Godfather",
    director: "Francis Ford Coppola",
  },
  {
    title: "Pulp Fiction",
    director: "Quentin Tarantino",
  },
  {
    title: "The Dark Knight",
    director: "Christopher Nolan",
  },
  {
    title: "Forrest Gump",
    director: "Robert Zemeckis",
  },
  {
    title: "Inception",
    director: "Christopher Nolan",
  },
  {
    title: "Schindler's List",
    director: "Steven Spielberg",
  },
  {
    title: "The Matrix",
    director: "Lana and Lilly Wachowski",
  },
  {
    title: "The Silence of the Lambs",
    director: "Jonathan Demme",
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    director: "Peter Jackson",
  },
  {
    title: "The Grand Budapest Hotel",
    director: "Wes Anderson",
  },
  {
    title: "The Social Network",
    director: "David Fincher",
  },
];

// Morgan middleware library to log all requests
app.use(morgan("common"));

//GET requests
app.get("/Movies", (req, res) => {
  res.json(topMovies);
});

app.get("/", (req, res) => {
  res.send("Welcome to the FilmSphere!");
});

// Serve static files from the 'public' folder
app.use(express.static("public"));

//Error Message
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Oops! Something went wrong. Our team is on it!");
});

// Start the server
app.listen(8080, () => {
  console.log("The app is listening on port 8080.");
});
