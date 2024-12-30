import express from "express";
const router = express.Router();
import * as reponseControllers from "../controllers/response.controllers";

router.post("/");
router.get("/", reponseControllers.getResponses);
router.put("/:id");
router.delete("/:id");
