import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  getItineraryByViaje,
  getItineraryById,
  saveItinerary,
  updateItinerary,
  deleteItinerary
} from "../controllers/itinerary.controller.js";

const router = express.Router();

/* ===========================
PROTEGER TODAS LAS RUTAS
=========================== */
router.use(authMiddleware);

/* ===========================
ROUTES
=========================== */
router.get("/viaje/:viajeId", getItineraryByViaje);
router.get("/:id", getItineraryById);
router.post("/", saveItinerary);
router.put("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);

export default router;