import pool from "../config/db.js";
import * as OperatorModel from "../models/operator.model.js";

/* =========================================
GET OPERATORS BY VIAJE
========================================= */
export const getOperatorsByViaje = async (req, res) => {
  try {
    const { viajeId } = req.params;

    const operators = await OperatorModel.getByViaje(viajeId);

    res.json(operators);
  } catch (err) {
    console.error("GET OPERATORS ERROR:", err);
    res.status(500).json({ error: "Error obteniendo operadores" });
  }
};

/* =========================================
GET OPERATOR BY ID
========================================= */
export const getOperatorById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const operator = await OperatorModel.getById(id, userId);

    if (!operator) {
      return res.status(404).json({ error: "Operador no encontrado" });
    }

    res.json(operator);
  } catch (err) {
    console.error("GET OPERATOR BY ID ERROR:", err);
    res.status(500).json({ error: "Error obteniendo operador" });
  }
};

/* =========================================
CREATE OPERATOR
========================================= */
export const createOperator = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;

    const {
      viaje_id,
      nombre,
      tipo_servicio,
      contacto,
      email,
      telefono,
      estado,
      condiciones_comerciales,
      notes
    } = req.body || {};

    if (!viaje_id) {
      return res.status(400).json({ error: "viaje_id requerido" });
    }

    if (!nombre) {
      return res.status(400).json({ error: "nombre requerido" });
    }

    await conn.beginTransaction();

    const id = await OperatorModel.createOperator(conn, {
      viaje_id,
      nombre,
      tipo_servicio,
      contacto,
      email,
      telefono,
      estado,
      condiciones_comerciales,
      notes,
      created_by: userId
    });

    await conn.commit();

    const saved = await OperatorModel.getById(id, userId);

    res.status(201).json(saved);
  } catch (err) {
    await conn.rollback();
    console.error("CREATE OPERATOR ERROR:", err);
    res.status(400).json({ error: err.message || "Error guardando operador" });
  } finally {
    conn.release();
  }
};

/* =========================================
UPDATE OPERATOR
========================================= */
export const updateOperator = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { id } = req.params;

    const exists = await OperatorModel.getById(id, userId);

    if (!exists) {
      return res.status(404).json({ error: "Operador no encontrado" });
    }

    await conn.beginTransaction();

    await OperatorModel.updateOperator(conn, id, req.body, userId);

    await conn.commit();

    const updated = await OperatorModel.getById(id, userId);

    res.json(updated);
  } catch (err) {
    await conn.rollback();
    console.error("UPDATE OPERATOR ERROR:", err);
    res.status(400).json({ error: err.message || "Error actualizando operador" });
  } finally {
    conn.release();
  }
};

/* =========================================
DELETE OPERATOR
========================================= */
export const deleteOperator = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { id } = req.params;

    const exists = await OperatorModel.getById(id, userId);

    if (!exists) {
      return res.status(404).json({ error: "Operador no encontrado" });
    }

    await conn.beginTransaction();

    await OperatorModel.deleteOperator(conn, id, userId);

    await conn.commit();

    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error("DELETE OPERATOR ERROR:", err);
    res.status(500).json({ error: "Error eliminando operador" });
  } finally {
    conn.release();
  }
};