import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { uploadCompanyLogo } from "../controllers/companyProfile.controller.js";
import {
  getMyCompanyProfile,
  saveMyCompanyProfile
} from "../controllers/companyProfile.controller.js";

const router = express.Router();

/* PROTEGIDO */
router.use(authMiddleware);

/* GET */
router.get("/me", getMyCompanyProfile);

/* POST / PUT */
router.post("/me", saveMyCompanyProfile);
router.post("/logo", upload.single("logo"), uploadCompanyLogo);
export default router;

