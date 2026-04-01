import pool from "../config/db.js";

/*
===========================
GET TRAVEL BY ID (GLOBAL)
===========================
*/
export const getTravelById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          v.*,
          c.nombre AS cliente_nombre
       FROM viajes v
       LEFT JOIN clientes c 
          ON v.cliente_id = c.id
       WHERE v.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET TRAVEL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/*
===========================
CREATE TRAVEL (GLOBAL)
===========================
*/
export const createTravel = async (req, res) => {
  const userId = req.user?.id;

  const {
    cliente_id,
    destino,
    nombre,
    fecha_inicio,
    fecha_fin,
    pasajero,
    tipo_viaje,
    estado,
    notas
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO viajes 
      (cliente_id, destino, nombre, fecha_inicio, fecha_fin, pasajero, tipo_viaje, estado, notas, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente_id,
        destino,
        nombre,
        fecha_inicio,
        fecha_fin,
        pasajero,
        tipo_viaje,
        estado || "borrador",
        notas,
        userId
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("CREATE TRAVEL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/*
===========================
UPDATE TRAVEL (SOLO OWNER)
===========================
*/
export const updateTravel = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const {
    cliente_id,
    destino,
    nombre,
    fecha_inicio,
    fecha_fin,
    pasajero,
    tipo_viaje,
    estado,
    notas
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE viajes SET
        cliente_id=?,
        destino=?,
        nombre=?,
        fecha_inicio=?,
        fecha_fin=?,
        pasajero=?,
        tipo_viaje=?,
        estado=?,
        notas=?
      WHERE id=? AND created_by=?`,
      [
        cliente_id,
        destino,
        nombre,
        fecha_inicio,
        fecha_fin,
        pasajero,
        tipo_viaje,
        estado,
        notas,
        id,
        userId
      ]
    );

    if (!result.affectedRows) {
      return res.status(403).json({ error: "No tenés permiso para editar este viaje" });
    }

    res.json({ message: "Viaje actualizado" });
  } catch (error) {
    console.error("UPDATE TRAVEL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/*
===========================
DELETE TRAVEL (SOLO OWNER)
===========================
*/
export const deleteTravel = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM viajes WHERE id = ? AND created_by = ?`,
      [id, userId]
    );

    if (!result.affectedRows) {
      return res.status(403).json({ error: "No tenés permiso para eliminar este viaje" });
    }

    res.json({ message: "Viaje eliminado" });
  } catch (error) {
    console.error("DELETE TRAVEL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/*
===========================
GET TRAVELS BY CLIENT (GLOBAL)
===========================
*/
export const getTravelsByClient = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const [rows] = await pool.query(
      `SELECT *
       FROM viajes
       WHERE cliente_id = ?
       ORDER BY created_at DESC`,
      [clienteId]
    );

    res.json(rows);
  } catch (error) {
    console.error("GET TRAVELS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};