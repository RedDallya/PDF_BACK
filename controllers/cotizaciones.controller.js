import pool from "../config/db.js";
import * as CotModel from "../models/cotizaciones.model.js";
import * as ServModel from "../models/services.model.js";
import { validateCotizacion } from "../validators/cotizaciones.validator.js";

/* =========================================
CREATE COTIZACION
========================================= */
export const createCotizacion = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    validateCotizacion(req.body);

    const userId = req.user.id;

    await conn.beginTransaction();

    const cotizacionId = await CotModel.createCotizacion(conn, {
      ...req.body,
      created_by: userId,
      updated_by: userId
    });

    await conn.commit();

    res.status(201).json({ id: cotizacionId });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};

/* =========================================
GET COTIZACIONES POR VIAJE (con ownership)
========================================= */
export const getCotizacionesByViaje = async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await CotModel.getCotizacionesByViaje(
      req.params.viajeId,
      userId
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================
GET COTIZACION COMPLETA
========================================= */
export const getCotizacionFull = async (req, res) => {
  try {
    const userId = req.user.id;

    const cot = await CotModel.getCotizacionById(req.params.id, userId);

    if (!cot) {
      return res.status(404).json({ error: "Cotizacion no existe" });
    }

    const servicios = await ServModel.getServiciosByCotizacion(req.params.id);

    cot.servicios = servicios;

    res.json(cot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================
UPDATE COTIZACION
========================================= */
export const updateCotizacion = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    validateCotizacion(req.body);

    const userId = req.user.id;

    await conn.beginTransaction();

    const exists = await CotModel.getCotizacionById(
      req.params.id,
      userId
    );

    if (!exists) {
      await conn.rollback();
      return res.status(404).json({ error: "Cotizacion no existe" });
    }

    await CotModel.updateCotizacion(conn, req.params.id, {
      ...req.body,
      updated_by: userId
    });

    await conn.commit();

    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};

/* =========================================
DELETE COTIZACION
========================================= */
export const deleteCotizacion = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;

    await conn.beginTransaction();

    const exists = await CotModel.getCotizacionById(
      req.params.id,
      userId
    );

    if (!exists) {
      await conn.rollback();
      return res.status(404).json({ error: "Cotizacion no existe" });
    }

    await CotModel.deleteCotizacion(conn, req.params.id);

    await conn.commit();

    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};
