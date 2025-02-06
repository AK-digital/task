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
  reponseControllers.sa
);

router.get(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  reponseControllers.getResponses
);

router.put(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  upload.fields([{ name: "medias", maxCount: 20 }]),
  reponseControllers.updateResponse
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  reponseControllers.deleteResponse
);

export default router;
