// pdf.routes.js
import express from "express";
import {
  generatePartialPdf,
  generateFullPdf,
  getPdfsByCotizacion,
  getLatestPdf
} from "../controllers/pdf.controller.js";

const router = express.Router();

// Generar PDF parcial
// GET /pdf/partial?cotizacion_id=123
router.get("/partial", generatePartialPdf);

// Generar PDF completo
// GET /pdf/full?cotizacion_id=123
router.get("/full", generateFullPdf);

// Listar todos los PDFs de una cotización
// GET /pdf/:cotizacionId
router.get("/:cotizacionId", getPdfsByCotizacion);

// Obtener el último PDF de un usuario para una cotización
// GET /pdf/latest/:cotizacionId
router.get("/latest/:cotizacionId", getLatestPdf);

export default router;

