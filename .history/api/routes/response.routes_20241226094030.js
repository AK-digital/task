import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as reponseControllers from "../controllers/response.controllers";

router.post("/");
router.get(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  reponseControllers.getResponses
);
router.put("/:id");
router.delete("/:id");
