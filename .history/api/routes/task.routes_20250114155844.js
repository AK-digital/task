import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as taskControllers from "../controllers/task.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

router.post(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.saveTask
);

router.get(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.getTasks
);

router.patch(
  "/:id/text",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.updateTaskText
);

router.patch(
  "/:id/description",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  upload.fields([{ name: "medias", maxCount: 20 }]),
  taskControllers.updateTaskDescription
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.deleteTask
);

router.patch(
  "/:id/add-responsible",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.addResponsible
);

router.patch(
  "/:id/remove-responsible",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.removeResponsible
);

router.patch(
  "/:id/start-timer",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.startTimer
);

router.patch(
  "/:id/end-timer",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.endTimer
);

export default router;
