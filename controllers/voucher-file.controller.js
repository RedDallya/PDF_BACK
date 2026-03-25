import fs from "fs";
import pool from "../config/db.js";
import * as VoucherModel from "../models/voucher.model.js";
import * as VoucherFileModel from "../models/voucher-file.model.js";

/* =========================================
UPLOAD FILES TO VOUCHER
========================================= */
export const uploadVoucherFiles = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { voucherId } = req.params;

    const voucher = await VoucherModel.getById(voucherId, userId);

    if (!voucher) {
      return res.status(404).json({ error: "Voucher no encontrado" });
    }

    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ error: "No se enviaron archivos" });
    }

    await conn.beginTransaction();

    for (const file of files) {
      await VoucherFileModel.createVoucherFile(conn, {
        voucher_id: Number(voucherId),
        original_name: file.originalname,
        stored_name: file.filename,
        file_path: file.path.replace(/\\/g, "/"),
        mime_type: file.mimetype,
        file_size: file.size
      });
    }

    await conn.commit();

    const savedFiles = await VoucherFileModel.getFilesByVoucher(voucherId, userId);

    res.status(201).json(savedFiles);
  } catch (err) {
    await conn.rollback();
    console.error("UPLOAD VOUCHER FILES ERROR:", err);
    res.status(400).json({ error: err.message || "Error subiendo archivos" });
  } finally {
    conn.release();
  }
};

/* =========================================
DELETE FILE FROM VOUCHER
========================================= */
export const deleteVoucherFile = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { fileId } = req.params;

    const file = await VoucherFileModel.getFileById(fileId, userId);

    if (!file) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    await conn.beginTransaction();

    await VoucherFileModel.deleteVoucherFile(conn, fileId, userId);

    await conn.commit();

    if (file.file_path && fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("DELETE VOUCHER FILE ERROR:", err);
    res.status(500).json({ error: "Error eliminando archivo" });
  } finally {
    conn.release();
  }
};