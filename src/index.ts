import express from "express";
import nunjucks from "nunjucks";
import request from "@fewlines-education/request";

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk");

app.get("/", (req, response) => {
  request("https://videogame-api.fly.dev/games", (error, body) => {
    if (error) {
      throw error;
    }
    const result = JSON.parse(body);

    response.render("home", { gameList: result.games });
  });
});

app.get("/games/:slug", (req, response) => {
  request(`https://videogame-api.fly.dev/games/slug/${req.params.slug}`, (error, body) => {
    if (error) {
      throw error;
    }
    const result = JSON.parse(body);

    response.render("gameDetails", { details: result });
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
