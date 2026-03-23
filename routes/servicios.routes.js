import express from "express";
import {
  createServicio,
  updateServicio,
  deleteServicio,
  getServicioById,
  getServiciosByCotizacion
} from "../controllers/servicios.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔐 Aplicar auth a TODAS las rutas
router.use(authMiddleware);

router.get("/cotizacion/:cotizacionId", getServiciosByCotizacion);
router.get("/:id", getServicioById);
router.post("/", createServicio);
router.put("/:id", updateServicio);
router.delete("/:id", deleteServicio);

export default router;
