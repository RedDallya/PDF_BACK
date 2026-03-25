import db from "../config/db.js";

/* =========================================
OWNERSHIP JOIN BASE
========================================= */
const OWNERSHIP_JOIN = `
  FROM itinerarios i
  JOIN viajes v ON i.viaje_id = v.id
`;

/* =========================================
GET BY VIAJE (ownership)
========================================= */
export async function getByViaje(viajeId, userId) {
  const [rows] = await db.query(
    `
    SELECT i.*
    ${OWNERSHIP_JOIN}
    WHERE i.viaje_id = ?
      AND v.created_by = ?
    ORDER BY i.updated_at DESC, i.id DESC
    LIMIT 1
    `,
    [viajeId, userId]
  );

  return rows[0] || null;
}

/* =========================================
GET BY ID (ownership)
========================================= */
export async function getById(id, userId) {
  const [rows] = await db.query(
    `
    SELECT i.*
    ${OWNERSHIP_JOIN}
    WHERE i.id = ?
      AND v.created_by = ?
    `,
    [id, userId]
  );

  return rows[0] || null;
}

/* =========================================
CREATE
========================================= */
export async function createItinerary(conn, data) {
  const {
    viaje_id,
    version,
    issue_date,
    notes,
    auto_generated,
    pdf_name,
    pdf_path,
    created_by
  } = data;

  // validar ownership del viaje
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
    INSERT INTO itinerarios
    (viaje_id, version, issue_date, notes, auto_generated, pdf_name, pdf_path, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      viaje_id,
      version || null,
      issue_date || null,
      notes || null,
      auto_generated ? 1 : 0,
      pdf_name || null,
      pdf_path || null,
      created_by
    ]
  );

  return result.insertId;
}

/* =========================================
UPDATE (ownership)
========================================= */
export async function updateItinerary(conn, id, data, userId) {
  const {
    version,
    issue_date,
    notes,
    auto_generated,
    pdf_name,
    pdf_path
  } = data;

  const [result] = await conn.query(
    `
    UPDATE itinerarios i
    JOIN viajes v ON i.viaje_id = v.id
    SET
      i.version = ?,
      i.issue_date = ?,
      i.notes = ?,
      i.auto_generated = ?,
      i.pdf_name = ?,
      i.pdf_path = ?
    WHERE i.id = ?
      AND v.created_by = ?
    `,
    [
      version || null,
      issue_date || null,
      notes || null,
      auto_generated ? 1 : 0,
      pdf_name || null,
      pdf_path || null,
      id,
      userId
    ]
  );

  return result.affectedRows > 0;
}

/* =========================================
UPSERT BY VIAJE
========================================= */
export async function upsertByViaje(conn, data, userId) {
  const existing = await getByViaje(data.viaje_id, userId);

  if (existing) {
    await updateItinerary(
      conn,
      existing.id,
      data,
      userId
    );
    return existing.id;
  }

  return createItinerary(conn, {
    ...data,
    created_by: userId
  });
}

/* =========================================
DELETE (ownership)
========================================= */
export async function deleteItinerary(conn, id, userId) {
  const [result] = await conn.query(
    `
    DELETE i FROM itinerarios i
    JOIN viajes v ON i.viaje_id = v.id
    WHERE i.id = ?
      AND v.created_by = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}