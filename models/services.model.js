import db from "../config/db.js";

/* =========================================
OWNERSHIP JOIN BASE
========================================= */
const OWNERSHIP_JOIN = `
  FROM servicios s
  JOIN cotizaciones c   ON s.cotizacion_id = c.id
  JOIN viajes v         ON c.viaje_id = v.id
  JOIN clientes cl      ON v.cliente_id = cl.id
`;

/* =========================================
GET SERVICIOS POR COTIZACION (ownership)
========================================= */
export async function getServiciosByCotizacion(cotizacionId, userId) {
  const [rows] = await db.query(
    `
    SELECT s.*
    ${OWNERSHIP_JOIN}
    WHERE s.cotizacion_id = ?
      AND cl.created_by = ?
    ORDER BY s.id ASC
    `,
    [cotizacionId, userId]
  );

  return rows;
}

/* =========================================
GET SERVICIO BY ID (ownership)
========================================= */
export async function getServicioById(id, userId) {
  const [rows] = await db.query(
    `
    SELECT s.*
    ${OWNERSHIP_JOIN}
    WHERE s.id = ?
      AND cl.created_by = ?
    `,
    [id, userId]
  );

  return rows[0] || null;
}

/* =========================================
CREATE SERVICIO (valida ownership de cotizacion)
========================================= */
export async function createServicio(conn, data) {
  const {
    cotizacion_id,
    categoria,
    descripcion,
    observaciones,
    moneda,
    precio,
    adultos,
    menores,
    subtotal,
    userId
  } = data;

  // Validar que la cotizacion pertenezca al usuario
  const [check] = await conn.query(
    `
    SELECT c.id
    FROM cotizaciones c
    JOIN viajes v    ON c.viaje_id = v.id
    JOIN clientes cl ON v.cliente_id = cl.id
    WHERE c.id = ?
      AND cl.created_by = ?
    `,
    [cotizacion_id, userId]
  );

  if (check.length === 0) {
    throw new Error("Cotizacion no pertenece al usuario");
  }

  const [result] = await conn.query(
    `
    INSERT INTO servicios
    (cotizacion_id, categoria, descripcion, observaciones, moneda, precio, adultos, menores, subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      cotizacion_id,
      categoria,
      descripcion,
      observaciones,
      moneda,
      precio,
      adultos,
      menores,
      subtotal
    ]
  );

  return result.insertId;
}

/* =========================================
UPDATE SERVICIO (conn, ownership ya validado)
========================================= */
export async function updateServicio(conn, id, data, userId) {
  const {
    categoria,
    descripcion,
    observaciones,
    moneda,
    precio,
    adultos,
    menores,
    subtotal
  } = data;

  const [result] = await conn.query(
    `
    UPDATE servicios s
    JOIN cotizaciones c   ON s.cotizacion_id = c.id
    JOIN viajes v         ON c.viaje_id = v.id
    JOIN clientes cl      ON v.cliente_id = cl.id
    SET
      s.categoria = ?,
      s.descripcion = ?,
      s.observaciones = ?,
      s.moneda = ?,
      s.precio = ?,
      s.adultos = ?,
      s.menores = ?,
      s.subtotal = ?
    WHERE s.id = ?
      AND cl.created_by = ?
    `,
    [
      categoria,
      descripcion,
      observaciones,
      moneda,
      precio,
      adultos,
      menores,
      subtotal,
      id,
      userId
    ]
  );

  return result.affectedRows > 0;
}

/* =========================================
DELETE SERVICIO (conn, ownership ya validado)
========================================= */
export async function deleteServicio(conn, id, userId) {
  const [result] = await conn.query(
    `
    DELETE s FROM servicios s
    JOIN cotizaciones c   ON s.cotizacion_id = c.id
    JOIN viajes v         ON c.viaje_id = v.id
    JOIN clientes cl      ON v.cliente_id = cl.id
    WHERE s.id = ?
      AND cl.created_by = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}

/* =========================================
TOTALES POR COTIZACION (ownership)
========================================= */
export async function getTotalsByCotizacion(cotizacionId, userId) {
  const [rows] = await db.query(
    `
    SELECT s.moneda, SUM(s.subtotal) AS total
    ${OWNERSHIP_JOIN}
    WHERE s.cotizacion_id = ?
      AND cl.created_by = ?
    GROUP BY s.moneda
    `,
    [cotizacionId, userId]
  );

  return rows;
}
