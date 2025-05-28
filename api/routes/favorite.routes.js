import { Router } from "express";
const router = Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as favoriteController from "../controllers/favorite.controllers.js";

router.post("/", authMiddlewares.auth, favoriteController.saveFavorite);

router.get("/", authMiddlewares.auth, favoriteController.getFavorites);

router.delete("/:id", authMiddlewares.auth, favoriteController.deleteFavorite);

export default router;
