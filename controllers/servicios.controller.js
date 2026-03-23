import pool from "../config/db.js";
import * as ServModel from "../models/services.model.js";
import * as MetaModel from "../models/serviciosMetadata.model.js";
import { validateServicio } from "../validators/servicios.validator.js";

/* =========================================
GET SERVICIOS POR COTIZACION (ownership)
========================================= */
export const getServiciosByCotizacion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cotizacionId } = req.params;

    const servicios = await ServModel.getServiciosByCotizacion(
      cotizacionId,
      userId
    );

    const full = await Promise.all(
      servicios.map(async s => {
        s.metadata = await MetaModel.getServicioMetadata(s.id);
        return s;
      })
    );

    res.json(full);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================
GET SERVICIO BY ID (ownership)
========================================= */
export const getServicioById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const servicio = await ServModel.getServicioById(id, userId);

    if (!servicio) {
      return res.status(404).json({ error: "Servicio no existe" });
    }

    servicio.metadata = await MetaModel.getServicioMetadata(servicio.id);

    res.json(servicio);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================
CREATE SERVICIO (ownership por cotizacion)
========================================= */
export const createServicio = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    validateServicio(req.body);

    const userId = req.user.id;

    await conn.beginTransaction();

    const servicioId = await ServModel.createServicio(conn, {
      ...req.body,
      userId
    });

    if (req.body.metadata) {
      await MetaModel.saveServicioMetadata(
        conn,
        servicioId,
        req.body.metadata
      );
    }

    await conn.commit();

    res.status(201).json({ id: servicioId });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });

  } finally {
    conn.release();
  }
};

/* =========================================
UPDATE SERVICIO (ownership)
========================================= */
export const updateServicio = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    validateServicio(req.body);

    const userId = req.user.id;
    const { id } = req.params;

    await conn.beginTransaction();

    const exists = await ServModel.getServicioById(id, userId);

    if (!exists) {
      await conn.rollback();
      return res.status(404).json({ error: "Servicio no existe" });
    }

    await ServModel.updateServicio(conn, id, req.body);

    if (req.body.metadata !== undefined) {
      await MetaModel.saveServicioMetadata(conn, id, req.body.metadata);
    }

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
DELETE SERVICIO (ownership)
========================================= */
export const deleteServicio = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { id } = req.params;

    await conn.beginTransaction();

    const exists = await ServModel.getServicioById(id, userId);

    if (!exists) {
      await conn.rollback();
      return res.status(404).json({ error: "Servicio no existe" });
    }

    await ServModel.deleteServicio(conn, id);

    await conn.commit();

    res.json({ ok: true });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });

  } finally {
    conn.release();
  }
};
