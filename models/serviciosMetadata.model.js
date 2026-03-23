import db from "../config/db.js";

export const getServicioMetadata = async (servicioId) => {
  const [rows] = await db.query(
    "SELECT meta_key, meta_value FROM servicios_metadata WHERE servicio_id=?",
    [servicioId]
  );

  const obj = {};
  rows.forEach(r => obj[r.meta_key] = r.meta_value);
  return obj;
};

export const saveServicioMetadata = async (conn, servicioId, metadata) => {
  await conn.query(
    "DELETE FROM servicios_metadata WHERE servicio_id=?",
    [servicioId]
  );

  for (const key in metadata) {
    await conn.query(
      "INSERT INTO servicios_metadata (servicio_id, meta_key, meta_value) VALUES (?, ?, ?)",
      [servicioId, key, metadata[key]]
    );
  }
};
