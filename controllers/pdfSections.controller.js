import pool from "../config/db.js";
import { PdfSectionModel } from "../models/pdfSection.model.js";

/* =========================================
CREATE SECTION
========================================= */
export const createSection = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔐 validar cotizacion del usuario
    const [check] = await pool.query(
      `
      SELECT c.id
      FROM cotizaciones c
      JOIN viajes v    ON c.viaje_id = v.id
      JOIN clientes cl ON v.cliente_id = cl.id
      WHERE c.id = ?
        AND cl.created_by = ?
      `,
      [req.body.cotizacion_id, userId]
    );

    if (!check.length) {
      return res.status(403).json({ error: "Cotizacion no válida" });
    }

    const id = await PdfSectionModel.create(req.body);

    res.status(201).json({ id });

  } catch (error) {
    console.error("CREATE SECTION ERROR:", error);
    res.status(500).json({ error: "Error creando sección" });
  }
};

/* =========================================
GET SECTIONS
========================================= */
export const getSections = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cotizacion_id } = req.params;

    // 🔐 validar ownership
    const [check] = await pool.query(
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

    if (!check.length) {
      return res.status(403).json({ error: "Cotizacion no válida" });
    }

    const data = await PdfSectionModel.getByCotizacion(cotizacion_id);

    res.json(data);

  } catch (error) {
    console.error("GET SECTIONS ERROR:", error);
    res.status(500).json({ error: "Error obteniendo secciones" });
  }
};

/* =========================================
UPDATE SECTION
========================================= */
export const updateSection = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔐 validar ownership por section
    const [check] = await pool.query(
      `
      SELECT ps.id
      FROM pdf_sections ps
      JOIN cotizaciones c ON ps.cotizacion_id = c.id
      JOIN viajes v       ON c.viaje_id = v.id
      JOIN clientes cl    ON v.cliente_id = cl.id
      WHERE ps.id = ?
        AND cl.created_by = ?
      `,
      [req.params.id, userId]
    );

    if (!check.length) {
      return res.status(403).json({ error: "Sección no válida" });
    }

    await PdfSectionModel.update(req.params.id, req.body);

    res.json({ success: true });

  } catch (error) {
    console.error("UPDATE SECTION ERROR:", error);
    res.status(500).json({ error: "Error actualizando sección" });
  }
};

/* =========================================
DELETE SECTION
========================================= */
export const deleteSection = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔐 validar ownership
    const [check] = await pool.query(
      `
      SELECT ps.id
      FROM pdf_sections ps
      JOIN cotizaciones c ON ps.cotizacion_id = c.id
      JOIN viajes v       ON c.viaje_id = v.id
      JOIN clientes cl    ON v.cliente_id = cl.id
      WHERE ps.id = ?
        AND cl.created_by = ?
      `,
      [req.params.id, userId]
    );

    if (!check.length) {
      return res.status(403).json({ error: "Sección no válida" });
    }

    await PdfSectionModel.remove(req.params.id);

    res.json({ success: true });

  } catch (error) {
    console.error("DELETE SECTION ERROR:", error);
    res.status(500).json({ error: "Error eliminando sección" });
  }
};