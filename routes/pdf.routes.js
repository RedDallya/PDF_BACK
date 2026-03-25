import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  generatePartialPdf,
  generateFullPdf,
  getPdfsByCotizacion,
  getLatestPdf
} from "../controllers/pdf.controller.js";

const router = express.Router();

/* ===========================
PROTEGER TODAS LAS RUTAS
=========================== */
router.use(authMiddleware);

/* ===========================
ROUTES
=========================== */
router.get("/partial", generatePartialPdf);
router.get("/full", generateFullPdf);
router.get("/latest/:cotizacionId", getLatestPdf);
router.get("/:cotizacionId", getPdfsByCotizacion);

export default router;