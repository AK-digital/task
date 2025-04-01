import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as projectMiddlewares from "../middlewares/projectRole.middlewares.js";
import * as draftControllers from "../controllers/draft.controllers.js";

router.post(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  draftControllers.saveDraft
);

router.get(
  "/",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  draftControllers.getDrafts
);

router.put(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  draftControllers.updateDraft
);

router.delete(
  "/:id",
  authMiddlewares.auth,
  projectMiddlewares.isAuthorOrGuests,
  draftControllers.deleteDraft
);

export default router;
