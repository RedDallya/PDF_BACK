// pdf.controller.js
import PDFDocument from "pdfkit";
import pool from "../config/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, "../assets/logo.png");

/* ===============================
   ENDPOINTS
================================ */

export async function generatePartialPdf(req, res) {
  return generatePdf(req, res, "partial");
}

export async function generateFullPdf(req, res) {
  return generatePdf(req, res, "full");
}

/* ===============================
   GENERAR PDF
================================ */

async function generatePdf(req, res, mode) {
  const cotizacion_id = req.body?.cotizacion_id || req.query?.cotizacion_id;

  if (!cotizacion_id) {
    return res.status(400).json({ error: "cotizacion_id requerido" });
  }

  /* ===============================
     QUERIES
  =============================== */

  const [[client]] = await pool.query(
    `
    SELECT c.*
    FROM clientes c
    JOIN viajes v ON v.cliente_id = c.id
    JOIN cotizaciones co ON co.viaje_id = v.id
    WHERE co.id = ?
    `,
    [cotizacion_id]
  );

  const [[trip]] = await pool.query(
    `
    SELECT v.*
    FROM viajes v
    JOIN cotizaciones co ON co.viaje_id = v.id
    WHERE co.id = ?
    `,
    [cotizacion_id]
  );

  const [services] = await pool.query(
    `
    SELECT *
    FROM servicios
    WHERE cotizacion_id = ?
    `,
    [cotizacion_id]
  );

  /* ===============================
     CREAR DOCUMENTO
  =============================== */

  const fileName = `cotizacion_${cotizacion_id}_${mode}_${Date.now()}.pdf`;
  const publicUrl = `/assets/pdfs/${fileName}`;

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  doc.pipe(res);

  /* ===============================
     RENDER PDF
  =============================== */

  drawHeader(doc);
  drawClientBlock(doc, client);
  drawTripBlock(doc, trip);
  drawServicesTable(doc, services);

  doc.end();

  /* ===============================
     GUARDAR METADATA
  =============================== */

  await pool.query(
    `INSERT INTO pdfs (cotizacion_id, nombre, url, tipo)
     VALUES (?, ?, ?, ?)`,
    [cotizacion_id, fileName, publicUrl, mode]
  );
}

/* ===============================
   LISTAR PDFs
================================ */

export async function getPdfsByCotizacion(req, res) {
  const { cotizacionId } = req.params;

  const [rows] = await pool.query(
    "SELECT * FROM pdfs WHERE cotizacion_id = ? ORDER BY created_at DESC",
    [cotizacionId]
  );

  res.json(rows);
}

/* ===============================
   OBTENER ÚLTIMO PDF DE USUARIO
================================ */

export async function getLatestPdf(req, res) {
  const { cotizacionId } = req.params;
  const userId = req.user?.id; // asegúrate de tener middleware de auth

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autorizado" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT url AS file_path, nombre
      FROM pdfs
      WHERE cotizacion_id = ? AND user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [cotizacionId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "PDF no encontrado" });
    }

    const pdf = rows[0];
    const fullPath = path.join(__dirname, "..", pdf.file_path);

    res.download(fullPath, pdf.nombre);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo PDF" });
  }
}

/* ===============================
   COMPONENTES VISUALES
================================ */

function drawHeader(doc) {
  try {
    doc.image(logoPath, 50, 40, { width: 120 });
  } catch {}

  doc
    .fontSize(18)
    .text("Lean Travel", 200, 50);

  doc
    .fontSize(10)
    .text("info@leantravel.com", 200, 70)
    .text("+54 223 XXXXXXX", 200, 85);

  doc.moveTo(50, 120).lineTo(550, 120).stroke();
  doc.moveDown(2);
}

function drawClientBlock(doc, client) {
  doc.fontSize(12).text("Datos del pasajero", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10)
    .text(`Nombre: ${client?.nombre || "-"}`)
    .text(`Email: ${client?.email || "-"}`)
    .text(`Teléfono: ${client?.telefono || "-"}`);

  doc.moveDown();
}

function drawTripBlock(doc, trip) {
  doc.fontSize(12).text("Datos del viaje", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10)
    .text(`Destino: ${trip?.destino || "-"}`)
    .text(`Fecha inicio: ${trip?.fecha_inicio || "-"}`)
    .text(`Fecha fin: ${trip?.fecha_fin || "-"}`);

  doc.moveDown();
}

function drawServicesTable(doc, services) {
  doc.fontSize(12).text("Servicios", { underline: true });
  doc.moveDown();

  services.forEach(s => {
    doc.fontSize(10)
      .text(`${s.categoria} - ${s.descripcion}`)
      .text(`Subtotal: ${s.moneda} ${s.subtotal}`);
    doc.moveDown();
  });
}
