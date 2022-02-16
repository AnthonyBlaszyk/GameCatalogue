import express from "express";
import nunjucks from "nunjucks";
import request from "@fewlines-education/request";

const app = express();
let compteur = 4;

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use(express.static("public"));

app.set("view engine", "njk");

app.get("/", (req, response) => {
  request(`https://videogame-api.fly.dev/games?page=${compteur}`, (error, body) => {
    if (error) {
      throw error;
    }
    const gameResult = JSON.parse(body);

    request("http://videogame-api.fly.dev/platforms", (error, body) => {
      if (error) {
        throw error;
      }

      const platformResult = JSON.parse(body);

      response.render("home", { gameList: gameResult.games, platformList: platformResult.platforms });
    });
  });
});

app.get("/games/:slug", (req, response) => {
  request(`https://videogame-api.fly.dev/games/slug/${req.params.slug}`, (error, body) => {
    if (error) {
      throw error;
    }
    const result = JSON.parse(body);
    console.log(result.games_genres);

    response.render("gameDetails", { details: result });
  });
});

app.get("/platform/:slug", (req, response) => {
  request("http://videogame-api.fly.dev/platforms", (error, body) => {
    if (error) {
      throw error;
    }

    const result = JSON.parse(body);
    const platform = result.platforms.find((element: { slug: string }) => element.slug === req.params.slug);

    request(`http://videogame-api.fly.dev/games/platforms/${platform.id}`, (error, body) => {
      if (error) {
        throw error;
      }

      const resultPlatform = JSON.parse(body);

      response.render("gameByPlatform", { gamesByPlatform: resultPlatform });
    });
  });
});

app.get("/gamesCatalogue/pagesSup", (req, response) => {
  compteur++;

  response.redirect("/");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
