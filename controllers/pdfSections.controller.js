import pool from "../config/db.js";
import { PdfSectionModel } from "../models/pdfSection.model.js";

/* =========================================
HELPERS
========================================= */
function normalizeContenido(value) {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return { texto: value };
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return {};
}

function buildSectionPayload(body = {}) {
  return {
    cotizacion_id: Number(body.cotizacion_id),
    tipo: body.tipo || "",
    titulo: body.titulo || body.title || null,
    contenido: normalizeContenido(body.contenido ?? body.content ?? {}),
    orden: body.orden ?? 0
  };
}

/* =========================================
CREATE SECTION
========================================= */
export const createSection = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = buildSectionPayload(req.body);

    if (!payload.cotizacion_id) {
      return res.status(400).json({ error: "cotizacion_id requerido" });
    }

    if (!payload.tipo) {
      return res.status(400).json({ error: "tipo requerido" });
    }

    const [check] = await pool.query(
      `
      SELECT c.id
      FROM cotizaciones c
      JOIN viajes v    ON c.viaje_id = v.id
      JOIN clientes cl ON v.cliente_id = cl.id
      WHERE c.id = ?
        AND cl.created_by = ?
      `,
      [payload.cotizacion_id, userId]
    );

    if (!check.length) {
      return res.status(403).json({ error: "Cotizacion no válida" });
    }

    const id = await PdfSectionModel.create(payload);

    res.status(201).json({
      id,
      ...payload
    });

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

    const normalized = (data || []).map(section => ({
      ...section,
      title: section.titulo || "",
      content: normalizeContenido(section.contenido)
    }));

    res.json(normalized);

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
    const { id } = req.params;

    const [check] = await pool.query(
      `
      SELECT ps.id, ps.cotizacion_id
      FROM pdf_sections ps
      JOIN cotizaciones c ON ps.cotizacion_id = c.id
      JOIN viajes v       ON c.viaje_id = v.id
      JOIN clientes cl    ON v.cliente_id = cl.id
      WHERE ps.id = ?
        AND cl.created_by = ?
      `,
      [id, userId]
    );

    if (!check.length) {
      return res.status(403).json({ error: "Sección no válida" });
    }

    const existing = check[0];

    const payload = {
      cotizacion_id: existing.cotizacion_id,
      tipo: req.body.tipo || req.body.section_type || undefined,
      titulo: req.body.titulo ?? req.body.title ?? undefined,
      contenido: req.body.contenido ?? req.body.content ?? undefined,
      orden: req.body.orden ?? undefined
    };

    const updateData = {};

    if (payload.tipo !== undefined) updateData.tipo = payload.tipo;
    if (payload.titulo !== undefined) updateData.titulo = payload.titulo;
    if (payload.contenido !== undefined) updateData.contenido = normalizeContenido(payload.contenido);
    if (payload.orden !== undefined) updateData.orden = payload.orden;

    await PdfSectionModel.update(id, updateData);

    res.json({
      success: true,
      id: Number(id),
      ...updateData
    });

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
    const { id } = req.params;

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
      [id, userId]
    );

    if (!check.length) {
      return res.status(403).json({ error: "Sección no válida" });
    }

    await PdfSectionModel.remove(id);

    res.json({ success: true });

  } catch (error) {
    console.error("DELETE SECTION ERROR:", error);
    res.status(500).json({ error: "Error eliminando sección" });
  }
};