import express from "express";
import {
  createSection,
  getSections,
  updateSection,
  deleteSection
} from "../controllers/pdfSections.controller.js";

const router = express.Router();

router.post("/", createSection);
router.get("/:cotizacion_id", getSections);
router.put("/:id", updateSection);
router.delete("/:id", deleteSection);

export default router;
