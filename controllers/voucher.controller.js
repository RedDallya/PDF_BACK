import pool from "../config/db.js";
import * as VoucherModel from "../models/voucher.model.js";
import * as VoucherFileModel from "../models/voucher-file.model.js";

/* =========================================
GET VOUCHERS BY VIAJE
========================================= */
export const getVouchersByViaje = async (req, res) => {
  try {
    const userId = req.user.id;
    const { viajeId } = req.params;

    const vouchers = await VoucherModel.getByViaje(viajeId, userId);

    const hydrated = await Promise.all(
      vouchers.map(async (voucher) => {
        const files = await VoucherFileModel.getFilesByVoucher(voucher.id, userId);
        return { ...voucher, files };
      })
    );

    res.json(hydrated);
  } catch (err) {
    console.error("GET VOUCHERS ERROR:", err);
    res.status(500).json({ error: "Error obteniendo vouchers" });
  }
};

/* =========================================
GET VOUCHER BY ID
========================================= */
export const getVoucherById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const voucher = await VoucherModel.getById(id, userId);

    if (!voucher) {
      return res.status(404).json({ error: "Voucher no encontrado" });
    }

    const files = await VoucherFileModel.getFilesByVoucher(id, userId);

    res.json({ ...voucher, files });
  } catch (err) {
    console.error("GET VOUCHER BY ID ERROR:", err);
    res.status(500).json({ error: "Error obteniendo voucher" });
  }
};

/* =========================================
CREATE VOUCHER
========================================= */
export const createVoucher = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;

    const body = req.body || {};

    const {
      viaje_id,
      tipo,
      servicio,
      proveedor,
      fecha_asociada,
      visible_cliente,
      notes
    } = body;

    if (!viaje_id) {
      return res.status(400).json({ error: "viaje_id requerido" });
    }

    if (!tipo) {
      return res.status(400).json({ error: "tipo requerido" });
    }

    await conn.beginTransaction();

    const id = await VoucherModel.createVoucher(conn, {
      viaje_id,
      tipo,
      servicio,
      proveedor,
      fecha_asociada,
      visible_cliente,
      notes,
      created_by: userId
    });

    await conn.commit();

    const saved = await VoucherModel.getById(id, userId);
    const files = await VoucherFileModel.getFilesByVoucher(id, userId);

    res.status(201).json({ ...saved, files });
  } catch (err) {
    await conn.rollback();
    console.error("CREATE VOUCHER ERROR:", err);
    res.status(400).json({ error: err.message || "Error guardando voucher" });
  } finally {
    conn.release();
  }
};

/* =========================================
UPDATE VOUCHER
========================================= */
export const updateVoucher = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { id } = req.params;
    const body = req.body || {};

    const exists = await VoucherModel.getById(id, userId);

    if (!exists) {
      return res.status(404).json({ error: "Voucher no encontrado" });
    }

    if (!req.body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: "Body requerido" });
    }

    if (!body.tipo) {
      return res.status(400).json({ error: "tipo requerido" });
    }

    await conn.beginTransaction();

    await VoucherModel.updateVoucher(conn, id, body, userId);

    await conn.commit();

    const updated = await VoucherModel.getById(id, userId);
    const files = await VoucherFileModel.getFilesByVoucher(id, userId);

    res.json({ ...updated, files });
  } catch (err) {
    await conn.rollback();
    console.error("UPDATE VOUCHER ERROR:", err);
    res.status(400).json({ error: err.message || "Error actualizando voucher" });
  } finally {
    conn.release();
  }
};

/* =========================================
DELETE VOUCHER
========================================= */
export const deleteVoucher = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { id } = req.params;

    const exists = await VoucherModel.getById(id, userId);

    if (!exists) {
      return res.status(404).json({ error: "Voucher no encontrado" });
    }

    await conn.beginTransaction();

    await VoucherModel.deleteVoucher(conn, id, userId);

    await conn.commit();

    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("DELETE VOUCHER ERROR:", err);
    res.status(500).json({ error: "Error eliminando voucher" });
  } finally {
    conn.release();
  }
};