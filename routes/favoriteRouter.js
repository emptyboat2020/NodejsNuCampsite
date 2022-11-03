const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user_id })
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user_id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach((favId) => {
            if (!favorite.campsites.includes(favId._id)) {
              favorite.campsites.push(favId._id);
            }
          });
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({ user: req.user_id, campsites: req.body })
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOneAndDelete({ user: req.user_id })
        .then((response) => {
          res.statusCode = 200;
          if (response) {
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("You do not have any favorites to delete.");
          }
        })
        .catch((err) => next(err));
    }
  );

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId} `
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user_id })
      .then((favorite) => {
        if (favorite) {
          if (!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
            favorite
              .save()
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch((err) => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end("That campsite is already in the list of favorites!");
          }
        } else {
          Favorite.create({
            user: req.user_id,
            campsites: [req.body.campsiteId],
          })
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on favorites/${req.params.campsiteId}`
    );
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOne({ user: req.user_id })
        .then((favorite) => {
          res.statusCode = 200;
          if (favorite) {
            const favIndex = favorite.campsites.indexOf(req.params.campsiteId);
            console.log("Favorite index", favIndex);
            if (favIndex !== -1) {
              favorite.campsites.splice(favIndex, 1);
              favorite
                .save()
                .then((favorite) => {
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch((err) => next(err));
            }
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("You do not have any favorites to delete.");
          }
        })
        .catch((err) => next(err));
    }
  );

module.exports = favoriteRouter;
