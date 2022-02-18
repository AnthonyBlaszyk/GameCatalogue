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
  request("http://videogame-api.fly.dev/games", (error, body) => {
    if (error) {
      throw error;
    }
    const totalResult = JSON.parse(body);

    let page = 1;
    if (req.query.page === undefined || Number(req.query.page) <= 0 || isNaN(Number(req.query.page))) {
      response.redirect("/games?page=1");
    } else if (Number(req.query.page) > Math.round(Number(totalResult.total) / 20)) {
      response.redirect("/games?page=4058");
    } else {
      page = Number(req.query.page);

      request(`https://videogame-api.fly.dev/games?page=${page}`, (error, body) => {
        if (error) {
          throw error;
        }
        const result = JSON.parse(body);

        response.render("games", { gameList: result.games, pageNumber: page });
      });
    }
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
  request(`http://videogame-api.fly.dev/platforms/slug/${req.params.slug}`, (error, body) => {
    if (error) {
      throw error;
    }

    const result = JSON.parse(body);
    const slug = req.params.slug;

    request(`http://videogame-api.fly.dev/games/platforms/${result.id}`, (error, body) => {
      if (error) {
        throw error;
      }

      const totalResult = JSON.parse(body); //8834
      const total: number = totalResult.total;

      let page = 1;
      if (req.query.pages === undefined || Number(req.query.pages) <= 0 || isNaN(Number(req.query.pages))) {
        response.redirect(`/platform/${slug}/?pages=1`);
      } else if (Number(req.query.pages) > total / 20 + 1) {
        response.redirect(`/platform/${slug}/?pages=${Math.round(total / 20)}`);
      } else {
        page = Number(req.query.pages);

        request(`http://videogame-api.fly.dev/games/platforms/${result.id}?page=${page}`, (error, body) => {
          if (error) {
            throw error;
          }

          const resultPlatform = JSON.parse(body);

          response.render("gameByPlatform", {
            gamesByPlatform: resultPlatform,
            slug: slug,
            pageNumber: page,
            totalPages: Math.round(total / 20),
          });
        });
      }
    });
  });
});

// Platform page
app.get("/platform", (req, response) => {
  request("http://videogame-api.fly.dev/platforms", (error, body) => {
    if (error) {
      throw error;
    }

    const totalResult = JSON.parse(body);

    let page = 1;

    if (req.query.page === undefined || Number(req.query.page) <= 0 || isNaN(Number(req.query.page))) {
      response.redirect("/platform?page=1");
    } else if (Number(req.query.page) > Math.round(Number(totalResult.total) / 20) + 1) {
      response.redirect("/platform?page=10");
    } else {
      page = Number(req.query.page);

      request(`http://videogame-api.fly.dev/platforms?page=${page}`, (error, body) => {
        if (error) {
          throw error;
        }

        const result = JSON.parse(body);

        response.render("platform", { platformsList: result.platforms, pageNumber: page });
      });
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
