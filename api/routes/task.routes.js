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

router.get(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.getTask
);

router.patch(
  "/:id/text",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.updateTaskText
);

router.patch(
  "/:id/status",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.updateTaskStatus
);

router.patch(
  "/:id/priority",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.updateTaskPriority
);

router.patch(
  "/:id/deadline",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.updateTaskDeadline
);

router.patch(
  "/:id/description",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  upload.fields([{ name: "medias", maxCount: 20 }]),
  taskControllers.updateTaskDescription
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
  "/:id/estimate",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.updateTaskEstimation
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

router.patch(
  "/:id/add-session",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.addTaskSession
);

router.patch(
  "/:id/remove-session",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.removeTaskSession
);

router.patch(
  "/reorder",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.updateTaskOrder
);

router.patch(
  "/:id/update-board",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.updateTaskBoard
);

router.patch(
  "/add-archive",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.addTaskToArchive
);

router.patch(
  "/remove-archive",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.removeTaskFromArchive
);

router.delete(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  taskControllers.deleteTask
);

export default router;
