import express from "express";
import nunjucks from "nunjucks";
import fetch from "node-fetch";

const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use(express.static("public"));

app.set("view engine", "njk");

// Home page > FETCH
app.get("/", (req, response) => {
  response.render("home");
});

// Games page > FETCH
app.get("/games", (req, response): Promise<void> => {
  let page = 1;
  return fetch("http://videogame-api.fly.dev/games")
    .then((result) => result.json())
    .then((pages) => {
      if (req.query.page === undefined || Number(req.query.page) <= 0 || isNaN(Number(req.query.page))) {
        response.redirect("/games?page=1");
      } else if (Number(req.query.page) > Math.round(Number(pages.total) / 20)) {
        response.redirect("/games?page=4058");
      } else {
        page = Number(req.query.page);
        return fetch(`https://videogame-api.fly.dev/games?page=${page}`)
          .then((gameResponse) => gameResponse.json())
          .then((gameList) => response.render("games", { gameList: gameList.games, pageNumber: page }));
      }
    });
});

// Game details page > FETCH
app.get("/games/:slug", (req, response): Promise<void> => {
  return fetch(`https://videogame-api.fly.dev/games/slug/${req.params.slug}`)
    .then((result) => result.json())
    .then((resultRender) => response.render("gameDetails", { details: resultRender }));
});

// Games by platform page > FETCH
app.get("/platform/:slug", (req, response): Promise<void> => {
  let page = 1;
  return fetch(`http://videogame-api.fly.dev/platforms/slug/${req.params.slug}`)
    .then((result) => result.json())
    .then((result) => {
      const slug = req.params.slug;
      return fetch(`http://videogame-api.fly.dev/games/platforms/${result.id}`)
        .then((platforms) => platforms.json())
        .then((resultTotal) => {
          if (req.query.pages === undefined || Number(req.query.pages) <= 0 || isNaN(Number(req.query.pages))) {
            response.redirect(`/platform/${slug}/?pages=1`);
          } else if (Number(req.query.pages) > resultTotal.total / 20 + 1) {
            response.redirect(`/platform/${slug}/?pages=${Math.round(resultTotal.total / 20)}`);
          } else {
            page = Number(req.query.pages);
            return fetch(`http://videogame-api.fly.dev/games/platforms/${result.id}?page=${page}`)
              .then((resultPlatform) => resultPlatform.json())
              .then((renderPlatform) => {
                response.render("gameByPlatform", {
                  gamesByPlatform: renderPlatform,
                  slug: slug,
                  pageNumber: page,
                  totalPages: Math.ceil(resultTotal.total / 20),
                });
              });
          }
        });
    });
});

// Platform page > FETCH
app.get("/platform", (req, response): Promise<void> => {
  let page = 1;
  return fetch("http://videogame-api.fly.dev/platforms")
    .then((result) => result.json())
    .then((result) => {
      if (req.query.page === undefined || Number(req.query.page) <= 0 || isNaN(Number(req.query.page))) {
        response.redirect("/platform?page=1");
      } else if (Number(req.query.page) > Math.round(Number(result.total) / 20) + 1) {
        response.redirect("/platform?page=10");
      } else {
        page = Number(req.query.page);
        return fetch(`http://videogame-api.fly.dev/platforms?page=${page}`)
          .then((resultRender) => resultRender.json())
          .then((resultRender) =>
            response.render("platform", { platformsList: resultRender.platforms, pageNumber: page }),
          );
      }
    });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
