import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  getOperatorsByViaje,
  getOperatorById,
  createOperator,
  updateOperator,
  deleteOperator
} from "../controllers/operator.controller.js";

const router = express.Router();

/* ===========================
PROTEGER TODAS LAS RUTAS
=========================== */
router.use(authMiddleware);

/* ===========================
ROUTES
=========================== */
router.get("/viaje/:viajeId", getOperatorsByViaje);
router.get("/:id", getOperatorById);
router.post("/", createOperator);
router.put("/:id", updateOperator);
router.delete("/:id", deleteOperator);

export default router;