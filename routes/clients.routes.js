import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from "../controllers/client.controller.js";

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
router.get("/", getClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;