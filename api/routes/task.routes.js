import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import { checkRole } from "../middlewares/projectRole.middlewares.js";
import * as taskControllers from "../controllers/task.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

router.post(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  taskControllers.saveTask
);

router.get(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]), // projectId query is required
  taskControllers.getTasks
);

router.get(
  "/:id",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer", "guest"]), // projectId query is required
  taskControllers.getTask
);

router.patch(
  "/:id/text",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  taskControllers.updateTaskText
);

router.patch(
  "/:id/status",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  taskControllers.updateTaskStatus
);

router.patch(
  "/:id/priority",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  taskControllers.updateTaskPriority
);

router.patch(
  "/:id/deadline",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  taskControllers.updateTaskDeadline
);

router.patch(
  "/:id/description",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  upload.fields([{ name: "medias", maxCount: 20 }]),
  taskControllers.updateTaskDescription
);

router.patch(
  "/:id/add-responsible",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  taskControllers.addResponsible
);

router.patch(
  "/:id/remove-responsible",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  taskControllers.removeResponsible
);

router.patch(
  "/:id/estimate",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  taskControllers.updateTaskEstimation
);

router.patch(
  "/:id/add-session",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  taskControllers.addTaskSession
);

router.patch(
  "/:id/remove-session",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  taskControllers.removeTaskSession
);

router.patch(
  "/reorder",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  taskControllers.updateTaskOrder
);

router.patch(
  "/:id/update-board",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  taskControllers.updateTaskBoard
);

router.patch(
  "/add-archive",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  taskControllers.addTaskToArchive
);

router.patch(
  "/remove-archive",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team"]), // projectId query is required
  taskControllers.removeTaskFromArchive
);

router.patch(
  ":id/description/reactions",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]),
  taskControllers.updateTaskDescriptionReactions
);

router.delete(
  "/",
  authMiddlewares.auth,
  checkRole(["owner", "manager", "team", "customer"]), // projectId query is required
  taskControllers.deleteTask
);

export default router;
