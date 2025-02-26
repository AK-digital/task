import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as boardControllers from "../controllers/board.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests, // projectId query is required
  boardControllers.saveBoard
);

router.get(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests, // projectId query is required
  boardControllers.getBoards
);

router.put(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests, // projectId query is required
  boardControllers.updateBoard
);

router.patch(
  "/:id/add-archive",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  boardControllers.addBoardToArchive
);

router.patch(
  "/:id/remove-archive",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  boardControllers.removeBoardFromArchive
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests, // projectId query is required
  boardControllers.deleteBoard
);

export default router;
