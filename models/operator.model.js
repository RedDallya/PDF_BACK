import db from "../config/db.js";

/* =========================================
OWNERSHIP JOIN BASE
========================================= */
const OWNERSHIP_JOIN = `
  FROM operadores o
  JOIN viajes v ON o.viaje_id = v.id
`;

/* =========================================
GET ALL BY VIAJE (ownership)
========================================= */
export async function getByViaje(viajeId, userId) {
  const [rows] = await db.query(
    `
    SELECT o.*
    ${OWNERSHIP_JOIN}
    WHERE o.viaje_id = ?
      AND v.created_by = ?
    ORDER BY o.updated_at DESC, o.id DESC
    `,
    [viajeId, userId]
  );

  return rows;
}

/* =========================================
GET BY ID (ownership)
========================================= */
export async function getById(id, userId) {
  const [rows] = await db.query(
    `
    SELECT o.*
    ${OWNERSHIP_JOIN}
    WHERE o.id = ?
      AND v.created_by = ?
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
      AND created_by = ?
    `,
    [viaje_id, created_by]
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
UPDATE (ownership)
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
    JOIN viajes v ON o.viaje_id = v.id
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
      AND v.created_by = ?
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
DELETE (ownership)
========================================= */
export async function deleteOperator(conn, id, userId) {
  const [result] = await conn.query(
    `
    DELETE o FROM operadores o
    JOIN viajes v ON o.viaje_id = v.id
    WHERE o.id = ?
      AND v.created_by = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}