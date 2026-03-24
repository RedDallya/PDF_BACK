import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  getTravelById,
  getTravelsByClient,
  createTravel,
  updateTravel,
  deleteTravel
} from "../controllers/viajes.controller.js";

const router = express.Router();

/*
===========================
PROTEGER TODAS LAS RUTAS
===========================
*/
router.use(authMiddleware);

/*
===========================
ROUTES
===========================
*/
router.get("/cliente/:clienteId", getTravelsByClient);

router.get("/:id", getTravelById);
router.post("/", createTravel);
router.put("/:id", updateTravel);
router.delete("/:id", deleteTravel);

export default router;