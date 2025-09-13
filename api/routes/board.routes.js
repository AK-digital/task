import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as boardControllers from "../controllers/board.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  boardControllers.saveBoard
);

router.get(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]), // projectId query is required
  boardControllers.getBoards
);

router.put(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  boardControllers.updateBoard
);

router.patch(
  "/:id/add-archive",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]),
  boardControllers.addBoardToArchive
);

router.patch(
  "/:id/remove-archive",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]),
  boardControllers.removeBoardFromArchive
);

router.patch(
  "/order",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]),
  boardControllers.updateBoardOrder
);

router.post(
  "/:id/duplicate",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  boardControllers.duplicateBoard
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  boardControllers.deleteBoard
);

export default router;
