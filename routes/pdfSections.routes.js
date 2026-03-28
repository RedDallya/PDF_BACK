import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createSection,
  getSections,
  updateSection,
  deleteSection
} from "../controllers/pdfSections.controller.js";

const router = express.Router();

/* ===========================
PROTEGER TODAS LAS RUTAS
=========================== */
router.use(authMiddleware);

/* ===========================
ROUTES
=========================== */
router.post("/", createSection);
router.get("/:cotizacion_id", getSections);
router.put("/:id", updateSection);
router.delete("/:id", deleteSection);

export default router;