import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import {
  getMyProfiles,
  getProfileById,
  saveProfile,
  deleteProfile,
  uploadProfileLogo,
  uploadProfileCover
} from "../controllers/companyProfile.controller.js";

const router = express.Router();

router.use(authMiddleware);

/* LIST */
router.get("/", getMyProfiles);

/* GET ONE */
router.get("/:id", getProfileById);

/* CREATE */
router.post("/", saveProfile);

/* UPDATE */
router.put("/:id", saveProfile);

/* DELETE */
router.delete("/:id", deleteProfile);

/* LOGO */
router.post("/:id/logo", upload.single("logo"), uploadProfileLogo);

/* COVER */
router.post("/:id/cover", upload.single("cover"), uploadProfileCover);

export default router;