import express from "express";
const router = express.Router();
import * as authMiddlewares from "../middlewares/jwt.middlewares.js";
import * as reponseControllers from "../controllers/response.controllers";

router.post("/");
router.get("/", authMiddlewares.auth, reponseControllers.getResponses);
router.put("/:id");
router.delete("/:id");
