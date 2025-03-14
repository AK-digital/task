import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as reponseControllers from "../controllers/message.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

router.post(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  reponseControllers.saveMessage
);

router.get(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  reponseControllers.getMessages
);

router.put(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  reponseControllers.updateMessage
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  reponseControllers.deleteMessage
);

export default router;
