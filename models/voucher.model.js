import db from "../config/db.js";

/* =========================================
OWNERSHIP JOIN BASE
========================================= */
const OWNERSHIP_JOIN = `
  FROM vouchers vc
  JOIN viajes v ON vc.viaje_id = v.id
`;

/* =========================================
GET ALL BY VIAJE (ownership)
========================================= */
export async function getByViaje(viajeId, userId) {
  const [rows] = await db.query(
    `
    SELECT vc.*
    ${OWNERSHIP_JOIN}
    WHERE vc.viaje_id = ?
      AND v.created_by = ?
    ORDER BY vc.updated_at DESC, vc.id DESC
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
    SELECT vc.*
    ${OWNERSHIP_JOIN}
    WHERE vc.id = ?
      AND v.created_by = ?
    `,
    [id, userId]
  );

  return rows[0] || null;
}

/* =========================================
CREATE
========================================= */
export async function createVoucher(conn, data = {}) {
  const {
    viaje_id,
    tipo,
    servicio,
    proveedor,
    fecha_asociada,
    visible_cliente,
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
    INSERT INTO vouchers
    (
      viaje_id,
      tipo,
      servicio,
      proveedor,
      fecha_asociada,
      visible_cliente,
      notes,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      viaje_id,
      tipo,
      servicio || null,
      proveedor || null,
      fecha_asociada || null,
      visible_cliente ? 1 : 0,
      notes || null,
      created_by
    ]
  );

  return result.insertId;
}

/* =========================================
UPDATE (ownership)
========================================= */
export async function updateVoucher(conn, id, data = {}, userId) {
  const {
    tipo,
    servicio,
    proveedor,
    fecha_asociada,
    visible_cliente,
    notes
  } = data;

  if (!tipo) {
    throw new Error("tipo requerido");
  }

  const [result] = await conn.query(
    `
    UPDATE vouchers vc
    JOIN viajes v ON vc.viaje_id = v.id
    SET
      vc.tipo = ?,
      vc.servicio = ?,
      vc.proveedor = ?,
      vc.fecha_asociada = ?,
      vc.visible_cliente = ?,
      vc.notes = ?
    WHERE vc.id = ?
      AND v.created_by = ?
    `,
    [
      tipo,
      servicio || null,
      proveedor || null,
      fecha_asociada || null,
      visible_cliente ? 1 : 0,
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
export async function deleteVoucher(conn, id, userId) {
  const [result] = await conn.query(
    `
    DELETE vc FROM vouchers vc
    JOIN viajes v ON vc.viaje_id = v.id
    WHERE vc.id = ?
      AND v.created_by = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}