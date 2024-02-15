const bodyParser = require("body-parser");
const express = require("express");
const app = express();
uuid = require("uuid");
morgan = require("morgan");

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Mike",
    favouriteMovies: [],
  },
  {
    id: 2,
    name: "Tyson",
    favouriteMovies: ["King of New York"],
  },
];

let movies = [
  {
    Title: "Star Wars",
    Description:
      "A long time ago, in a galaxy far, far away, a young farm boy named Luke Skywalker embarks on an epic journey to rescue Princess Leia from the evil Galactic Empire.",
    Director: {
      Name: "George Lucas",
      Bio: "George Walton Lucas Jr. is an American film director, producer, and screenwriter. He is best known for creating the Star Wars and Indiana Jones franchises.",
      Birth: "May 14, 1944 (age 77 years), Modesto, California, United States",
    },
    Genre: {
      Name: "Science Fiction",
      Description:
        "Science fiction (or sci-fi or SF) is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, mutants, interstellar travel, time travel, or other technologies.",
    },
  },
  {
    Title: "The Dark Knight",
    Description:
      "In Gotham City, the Joker, a criminal mastermind, unleashes chaos and sets out to undermine Batman's influence and create anarchy. Batman must confront the Joker's malevolent plans while dealing with his own internal struggles.",
    Director: {
      Name: "Christopher Nolan",
      Bio: "Christopher Nolan is a British-American film director, producer, and screenwriter. He is known for directing complex and visually striking films such as Inception, Interstellar, and The Dark Knight Trilogy.",
      Birth:
        "July 30, 1970 (age 51 years), Westminster, London, United Kingdom",
    },
    Genre: {
      Name: "Action, Crime, Drama",
      Description:
        "Action, Crime, Drama is a film genre that combines elements of action and crime films. It typically involves a protagonist who is trying to prevent or solve a crime, often with violence and thrilling sequences.",
    },
  },
  {
    Title: "King of New York",
    Description:
      "King of New York follows Frank White, a former drug lord recently released from prison, as he returns to the streets of New York with a desire to rebuild his empire. The film explores themes of crime, power, and morality.",
    Director: {
      Name: "Abel Ferrara",
      Bio: "Abel Ferrara is an American filmmaker, known for his work in the crime and horror genres. In addition to directing King of New York, Ferrara has helmed films like Bad Lieutenant and The Funeral.",
      Birth: "July 19, 1951 (age 70 years), The Bronx, New York, United States",
    },
    Genre: {
      Name: "Crime, Thriller",
      Description:
        "Crime, Thriller is a film genre that combines elements of crime and thriller genres. It typically involves a protagonist who is involved in a crime or investigation, with suspenseful and thrilling elements.",
    },
  },
];

// Morgan middleware library to log all requests
app.use(morgan("common"));

//CREATE
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

//UPDATE
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

//POST
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favouriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

//DELETE
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favouriteMovies = user.favouriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

//DELETE
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user = users.filter((user) => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send("no such user");
  }
});

//READ
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//READ
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

//READ
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre");
  }
});

//READ
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director");
  }
});

//Welcoming Route
app.get("/", (req, res) => {
  res.send("Welcome to the FilmSphere!");
});

//Serve static files from the 'public' folder
app.use(express.static("public"));

//Error Message
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Oops! Something went wrong. Our team is on it!");
});

//Start the server
app.listen(8080, () => {
  console.log("The app is listening on port 8080.");
});
