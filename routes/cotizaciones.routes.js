import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createCotizacion,
  getCotizacionesByViaje,
  getCotizacionFull,
  updateCotizacion,
  deleteCotizacion
} from "../controllers/cotizaciones.controller.js";

const router = express.Router();

// Todas protegidas
router.get("/viaje/:viajeId", authMiddleware, getCotizacionesByViaje);
router.get("/:id", authMiddleware, getCotizacionFull);
router.post("/", authMiddleware, createCotizacion);
router.put("/:id", authMiddleware, updateCotizacion);
router.delete("/:id", authMiddleware, deleteCotizacion);

export default router;
