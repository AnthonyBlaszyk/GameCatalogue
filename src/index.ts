import express from "express";
import nunjucks from "nunjucks";
import request from "@fewlines-education/request";
const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use(express.static("public"));

app.set("view engine", "njk");

// Home page
app.get("/", (req, response) => {
  response.render("home");
});

// Games page
app.get("/games", (req, response) => {
  let page = 1;

  if (req.query.page === undefined || Number(req.query.page) <= 0 || isNaN(Number(req.query.page))) {
    page = 1;
  } else {
    page = Number(req.query.page);
  }

  request(`https://videogame-api.fly.dev/games?page=${page}`, (error, body) => {
    if (error) {
      throw error;
    }
    const result = JSON.parse(body);

    response.render("games", { gameList: result.games, pageNumber: page });
  });
});

// Games details page
app.get("/games/:slug", (req, response) => {
  request(`https://videogame-api.fly.dev/games/slug/${req.params.slug}`, (error, body) => {
    if (error) {
      throw error;
    }
    const result = JSON.parse(body);

    response.render("gameDetails", { details: result });
  });
});

// Games by plateform page
app.get("/platform/:slug", (req, response) => {
  let page = 1;

  if (req.query.pages === undefined || Number(req.query.pages) <= 0 || isNaN(Number(req.query.pages))) {
    page = 1;
  } else {
    page = Number(req.query.pages);
  }

  request(`http://videogame-api.fly.dev/platforms/slug/${req.params.slug}`, (error, body) => {
    if (error) {
      throw error;
    }

    const result = JSON.parse(body);
    const slug = req.params.slug;

    request(`http://videogame-api.fly.dev/games/platforms/${result.id}?page=${page}`, (error, body) => {
      if (error) {
        throw error;
      }

      const resultPlatform = JSON.parse(body);

      response.render("gameByPlatform", { gamesByPlatform: resultPlatform, slug: slug, pages: page });
    });
  });
});

// Platform page
app.get("/platform", (req, response) => {
  let page = 1;

  if (req.query.page === undefined || Number(req.query.page) <= 0 || isNaN(Number(req.query.page))) {
    page = 1;
  } else {
    page = Number(req.query.page);
  }

  request(`http://videogame-api.fly.dev/platforms?page=${page}`, (error, body) => {
    if (error) {
      throw error;
    }
    const result = JSON.parse(body);
    console.log(result);

    response.render("platform", { platformsList: result.platforms, pageNumber: page });
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
