import db from "../config/db.js";

/* =========================================
GET ALL BY VIAJE (lectura global)
========================================= */
export async function getByViaje(viajeId) {
  const [rows] = await db.query(
    `
    SELECT o.*
    FROM operadores o
    WHERE o.viaje_id = ?
    ORDER BY o.updated_at DESC, o.id DESC
    `,
    [viajeId]
  );

  return rows;
}

/* =========================================
GET BY ID (solo owner)
========================================= */
export async function getById(id, userId) {
  const [rows] = await db.query(
    `
    SELECT o.*
    FROM operadores o
    WHERE o.id = ?
      AND o.created_by = ?
    `,
    [id, userId]
  );

  return rows[0] || null;
}

/* =========================================
CREATE
========================================= */
export async function createOperator(conn, data) {
  const {
    viaje_id,
    nombre,
    tipo_servicio,
    contacto,
    email,
    telefono,
    estado,
    condiciones_comerciales,
    notes,
    created_by
  } = data;

  const [check] = await conn.query(
    `
    SELECT id
    FROM viajes
    WHERE id = ?
    `,
    [viaje_id]
  );

  if (!check.length) {
    throw new Error("Viaje no válido");
  }

  const [result] = await conn.query(
    `
    INSERT INTO operadores
    (
      viaje_id,
      nombre,
      tipo_servicio,
      contacto,
      email,
      telefono,
      estado,
      condiciones_comerciales,
      notes,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      viaje_id,
      nombre,
      tipo_servicio || null,
      contacto || null,
      email || null,
      telefono || null,
      estado || null,
      condiciones_comerciales || null,
      notes || null,
      created_by
    ]
  );

  return result.insertId;
}

/* =========================================
UPDATE (solo owner)
========================================= */
export async function updateOperator(conn, id, data, userId) {
  const {
    nombre,
    tipo_servicio,
    contacto,
    email,
    telefono,
    estado,
    condiciones_comerciales,
    notes
  } = data;

  const [result] = await conn.query(
    `
    UPDATE operadores o
    SET
      o.nombre = ?,
      o.tipo_servicio = ?,
      o.contacto = ?,
      o.email = ?,
      o.telefono = ?,
      o.estado = ?,
      o.condiciones_comerciales = ?,
      o.notes = ?
    WHERE o.id = ?
      AND o.created_by = ?
    `,
    [
      nombre,
      tipo_servicio || null,
      contacto || null,
      email || null,
      telefono || null,
      estado || null,
      condiciones_comerciales || null,
      notes || null,
      id,
      userId
    ]
  );

  return result.affectedRows > 0;
}

/* =========================================
DELETE (solo owner)
========================================= */
export async function deleteOperator(conn, id, userId) {
  const [result] = await conn.query(
    `
    DELETE FROM operadores
    WHERE id = ?
      AND created_by = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}