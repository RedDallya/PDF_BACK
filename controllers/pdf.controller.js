import PDFDocument from "pdfkit";
import pool from "../config/db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, "../assets/logo.png");
const pdfDir = path.join(__dirname, "../assets/pdfs");

fs.mkdirSync(pdfDir, { recursive: true });

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
  try {
    const userId = req.user?.id;
    const cotizacion_id = req.body?.cotizacion_id || req.query?.cotizacion_id;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    if (!cotizacion_id) {
      return res.status(400).json({ error: "cotizacion_id requerido" });
    }

    /* 🔐 VALIDAR OWNERSHIP */
    const [[cot]] = await pool.query(
      `
      SELECT co.id
      FROM cotizaciones co
      JOIN viajes v    ON co.viaje_id = v.id
      JOIN clientes cl ON v.cliente_id = cl.id
      WHERE co.id = ?
        AND cl.created_by = ?
      `,
      [cotizacion_id, userId]
    );

    if (!cot) {
      return res.status(403).json({ error: "Cotizacion no válida" });
    }

    /* ===============================
       DATA
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
      ORDER BY id ASC
      `,
      [cotizacion_id]
    );

    /* ===============================
       PDF
    =============================== */

    const fileName = `cotizacion_${cotizacion_id}_${mode}_${Date.now()}.pdf`;
    const publicUrl = `/assets/pdfs/${fileName}`;
    const fullFilePath = path.join(pdfDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const fileStream = fs.createWriteStream(fullFilePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(fileStream);
    doc.pipe(res);

    drawHeader(doc);
    drawClientBlock(doc, client);
    drawTripBlock(doc, trip);
    drawServicesTable(doc, services, mode);

    doc.end();

    await new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });

    /* ===============================
       SAVE DB
    =============================== */

    await pool.query(
      `
      INSERT INTO pdfs (cotizacion_id, nombre, url, tipo, user_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [cotizacion_id, fileName, publicUrl, mode, userId]
    );

  } catch (err) {
    console.error("GENERATE PDF ERROR:", err);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Error generando PDF" });
    }
  }
}

/* ===============================
   LISTAR PDFs (ownership)
================================ */

export async function getPdfsByCotizacion(req, res) {
  try {
    const userId = req.user.id;
    const { cotizacionId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT p.*
      FROM pdfs p
      JOIN cotizaciones c ON p.cotizacion_id = c.id
      JOIN viajes v ON c.viaje_id = v.id
      JOIN clientes cl ON v.cliente_id = cl.id
      WHERE p.cotizacion_id = ?
        AND cl.created_by = ?
      ORDER BY p.created_at DESC, p.id DESC
      `,
      [cotizacionId, userId]
    );

    res.json(rows);

  } catch (err) {
    console.error("GET PDFS ERROR:", err);
    res.status(500).json({ error: "Error obteniendo PDFs" });
  }
}

/* ===============================
   ÚLTIMO PDF
================================ */

export async function getLatestPdf(req, res) {
  try {
    const userId = req.user.id;
    const { cotizacionId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT p.*
      FROM pdfs p
      JOIN cotizaciones c ON p.cotizacion_id = c.id
      JOIN viajes v ON c.viaje_id = v.id
      JOIN clientes cl ON v.cliente_id = cl.id
      WHERE p.cotizacion_id = ?
        AND cl.created_by = ?
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 1
      `,
      [cotizacionId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "PDF no encontrado" });
    }

    const pdf = rows[0];
    const normalizedUrl = String(pdf.url || "").replace(/^\/+/, "");
    const fullPath = path.join(__dirname, "..", normalizedUrl);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Archivo PDF no encontrado en disco" });
    }

    return res.download(fullPath, pdf.nombre);

  } catch (err) {
    console.error("LATEST PDF ERROR:", err);
    res.status(500).json({ error: "Error obteniendo PDF" });
  }
}

/* ===============================
   COMPONENTES VISUALES
================================ */

function drawHeader(doc) {
  try {
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 120 });
    }
  } catch {}

  doc.fontSize(18).text("Lean Travel", 200, 50);
  doc.fontSize(10)
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
    .text(`Fecha inicio: ${formatDateForPdf(trip?.fecha_inicio)}`)
    .text(`Fecha fin: ${formatDateForPdf(trip?.fecha_fin)}`);

  doc.moveDown();
}

function drawServicesTable(doc, services, mode) {
  doc.fontSize(12).text("Servicios", { underline: true });
  doc.moveDown();

  if (!services?.length) {
    doc.fontSize(10).text("No hay servicios cargados.");
    doc.moveDown();
    return;
  }

  services.forEach((s) => {
    doc.fontSize(10).text(`${s.categoria || "-"} - ${s.descripcion || "-"}`);

    if (mode === "full") {
      doc.text(`Subtotal: ${s.moneda || "-"} ${Number(s.subtotal || 0).toFixed(2)}`);
    }

    doc.moveDown();
  });
}

function formatDateForPdf(value) {
  if (!value) return "-";
  const raw = String(value);
  if (raw.includes("T")) return raw.split("T")[0];
  if (raw.includes(" ")) return raw.split(" ")[0];
  return raw;
}