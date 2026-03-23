import express from "express";
import { upload } from "../middlewares/upload.js";

import {
  createClientDocument,
  getClientDocuments,
  deleteClientDocument
} from "../controllers/clientDocuments.controller.js";

const router = express.Router();

router.get("/:clientId", getClientDocuments);
router.delete("/:id", deleteClientDocument);
router.post("/", upload.single("file"), createClientDocument);

export default router;
