import db from "../config/db.js";

/* =========================================
GET COTIZACIONES POR VIAJE (GLOBAL)
========================================= */
export async function getCotizacionesByViaje(viajeId) {
  const [rows] = await db.query(
    `
    SELECT c.*
    FROM cotizaciones c
    WHERE c.viaje_id = ?
    ORDER BY c.id ASC
    `,
    [viajeId]
  );

  return rows;
}

/* =========================================
GET COTIZACION BY ID (GLOBAL)
========================================= */
export async function getCotizacionById(id) {
  const [rows] = await db.query(
    `
    SELECT c.*
    FROM cotizaciones c
    WHERE c.id = ?
    `,
    [id]
  );

  return rows[0] || null;
}

/* =========================================
CREATE COTIZACION (GLOBAL)
========================================= */
export async function createCotizacion(conn, data) {
  const {
    viaje_id,
    titulo,
    condicion_legal,
    fecha_creacion,
    created_by
  } = data;

  const [check] = await conn.query(
    `
    SELECT id FROM viajes
    WHERE id = ?
    `,
    [viaje_id]
  );

  if (check.length === 0) {
    throw new Error("Viaje no válido");
  }

  const [result] = await conn.query(
    `
    INSERT INTO cotizaciones
    (
      viaje_id,
      titulo,
      condicion_legal,
      fecha_creacion,
      created_by,
      updated_by
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      viaje_id,
      titulo,
      condicion_legal || null,
      fecha_creacion || null,
      created_by,
      created_by
    ]
  );

  return result.insertId;
}

/* =========================================
UPDATE COTIZACION (SOLO OWNER)
========================================= */
export async function updateCotizacion(conn, id, data, userId) {
  const {
    titulo,
    condicion_legal,
    fecha_creacion,
    estado
  } = data;

  const [result] = await conn.query(
    `
    UPDATE cotizaciones
    SET 
      titulo = ?,
      condicion_legal = ?,
      fecha_creacion = ?,
      estado = ?,
      updated_by = ?
    WHERE id = ?
      AND created_by = ?
    `,
    [
      titulo,
      condicion_legal || null,
      fecha_creacion || null,
      estado || null,
      userId,
      id,
      userId
    ]
  );

  return result.affectedRows > 0;
}

/* =========================================
DELETE COTIZACION (SOLO OWNER)
========================================= */
export async function deleteCotizacion(conn, id, userId) {
  const [result] = await conn.query(
    `
    DELETE FROM cotizaciones
    WHERE id = ?
      AND created_by = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}