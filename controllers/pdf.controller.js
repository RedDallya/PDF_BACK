import PDFDocument from "pdfkit";
import pool from "../config/db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultLogoPath = path.join(__dirname, "../assets/logo.png");
const pdfDir = path.join(__dirname, "../assets/pdfs");

fs.mkdirSync(pdfDir, { recursive: true });

/* ===============================
   FALLBACK BRANDING
================================ */

const DEFAULT_BRANDING = {
  company_name: "Lean Travel",
  company_email: "info@leantravel.com",
  company_phone: "+54 223 XXXXXXX",
  company_address: "",
  company_website: "",
  logo_path: defaultLogoPath,
  pdf_footer: "",
  layout_type: "classic",
  cover_image_path: null
};

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
    const profile_id = req.body?.profile_id || req.query?.profile_id;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    if (!cotizacion_id) {
      return res.status(400).json({ error: "cotizacion_id requerido" });
    }

    if (!profile_id) {
      return res.status(400).json({ error: "profile_id requerido" });
    }

    const [[cot]] = await pool.query(
      `
      SELECT co.id
      FROM cotizaciones co
      WHERE co.id = ?
      `,
      [cotizacion_id]
    );

    if (!cot) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }

    const [[quote]] = await pool.query(
      `SELECT * FROM cotizaciones WHERE id = ?`,
      [cotizacion_id]
    );

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
      `SELECT * FROM servicios WHERE cotizacion_id = ? ORDER BY id ASC`,
      [cotizacion_id]
    );

    const [sections] = await pool.query(
      `
      SELECT *
      FROM pdf_sections
      WHERE cotizacion_id = ?
      ORDER BY orden ASC, id ASC
      `,
      [cotizacion_id]
    );

    let vouchers = [];
    let operators = [];

    if (trip?.id) {
      const [voucherRows] = await pool.query(
        `
        SELECT *
        FROM vouchers
        WHERE viaje_id = ?
          AND visible_cliente = 1
        ORDER BY fecha_asociada ASC, id ASC
        `,
        [trip.id]
      );
      vouchers = voucherRows || [];

      const [operatorRows] = await pool.query(
        `
        SELECT *
        FROM operadores
        WHERE viaje_id = ?
        ORDER BY id ASC
        `,
        [trip.id]
      );
      operators = operatorRows || [];
    }

    const branding = await getBrandingForProfile(userId, profile_id);

    const fileName = `cotizacion_${cotizacion_id}_${mode}_${Date.now()}.pdf`;
    const publicUrl = `/assets/pdfs/${fileName}`;
    const fullFilePath = path.join(pdfDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const fileStream = fs.createWriteStream(fullFilePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(fileStream);
    doc.pipe(res);

    drawHeader(doc, branding);

    if (branding.layout_type === "proposal") {
      drawProposalIntro(doc, branding, quote, trip, client);
    }

    if (sections.length) {
      drawDynamicSections(doc, sections, {
        client,
        trip,
        services,
        vouchers,
        operators,
        quote,
        mode,
        branding
      });
    } else {
      drawQuoteBlock(doc, quote, mode);
      drawClientBlock(doc, client);
      drawTripBlock(doc, trip);
      drawServicesTable(doc, services, mode);
      drawVouchersBlock(doc, vouchers);
      drawOperatorsBlock(doc, operators);
      drawLegalBlock(doc, quote);
      drawFooterBlock(doc, branding);
    }

    doc.end();

    await new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });

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
   LISTAR PDFs (lectura global)
================================ */

export async function getPdfsByCotizacion(req, res) {
  try {
    const userId = req.user.id;
    const { cotizacionId } = req.params;

    const [[cot]] = await pool.query(
      `SELECT id FROM cotizaciones WHERE id = ?`,
      [cotizacionId]
    );

    if (!cot) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        p.*,
        CASE WHEN p.user_id = ? THEN 1 ELSE 0 END AS can_edit
      FROM pdfs p
      WHERE p.cotizacion_id = ?
      ORDER BY p.created_at DESC, p.id DESC
      `,
      [userId, cotizacionId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET PDFS ERROR:", err);
    res.status(500).json({ error: "Error obteniendo PDFs" });
  }
}

/* ===============================
   ÚLTIMO PDF (lectura global)
================================ */

export async function getLatestPdf(req, res) {
  try {
    const { cotizacionId } = req.params;

    const [[cot]] = await pool.query(
      `SELECT id FROM cotizaciones WHERE id = ?`,
      [cotizacionId]
    );

    if (!cot) {
      return res.status(404).json({ error: "Cotización no encontrada" });
    }

    const [rows] = await pool.query(
      `
      SELECT p.*
      FROM pdfs p
      WHERE p.cotizacion_id = ?
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT 1
      `,
      [cotizacionId]
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
   BRANDING
================================ */

async function getBrandingForProfile(userId, profileId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        profile_name,
        company_name,
        company_email,
        company_phone,
        company_address,
        company_website,
        logo_path,
        cover_image_path,
        pdf_footer,
        layout_type
      FROM pdf_brand_profiles
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [profileId, userId]
    );

    const profile = rows?.[0];

    if (!profile) {
      return {
        ...DEFAULT_BRANDING,
        layout_type: "classic",
        cover_image_path: null
      };
    }

    return {
      company_name: profile.company_name || DEFAULT_BRANDING.company_name,
      company_email: profile.company_email || DEFAULT_BRANDING.company_email,
      company_phone: profile.company_phone || DEFAULT_BRANDING.company_phone,
      company_address: profile.company_address || DEFAULT_BRANDING.company_address,
      company_website: profile.company_website || DEFAULT_BRANDING.company_website,
      logo_path: profile.logo_path || null,
      cover_image_path: profile.cover_image_path || null,
      pdf_footer: profile.pdf_footer || DEFAULT_BRANDING.pdf_footer,
      layout_type: profile.layout_type || "classic"
    };
  } catch (error) {
    console.error("GET BRAND PROFILE ERROR:", error);
    return {
      ...DEFAULT_BRANDING,
      layout_type: "classic",
      cover_image_path: null
    };
  }
}

function resolveAssetPath(filePathFromDb, fallback = null) {
  if (!filePathFromDb) return fallback;

  const normalized = String(filePathFromDb).trim().replace(/\\/g, "/");
  if (!normalized) return fallback;

  const cleaned = normalized.replace(/^\/+/, "");
  const fileName = path.basename(cleaned);

  const candidates = [
    path.join(__dirname, "..", cleaned),
    path.join(process.cwd(), cleaned),
    path.join(__dirname, "..", "uploads", fileName),
    path.join(process.cwd(), "uploads", fileName)
  ];

  for (const candidatePath of candidates) {
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  console.warn("No se encontró imagen:", {
    original: filePathFromDb,
    candidates
  });

  return fallback;
}

/* ===============================
   RENDER DINÁMICO
================================ */

function drawDynamicSections(doc, sections, context) {
  sections.forEach(section => {
    const tipo = section.tipo;
    const contenido = normalizeMetadata(section.contenido);

    ensureSpace(doc, 120);

    switch (tipo) {
      case "titulo":
        doc.fontSize(16).text(contenido.texto || "Título");
        doc.moveDown();
        break;

      case "mensaje":
        doc.fontSize(10).text(contenido.texto || "");
        doc.moveDown();
        break;

      case "cliente":
        drawClientBlock(doc, context.client);
        break;

      case "viaje":
        drawTripBlock(doc, context.trip);
        break;

      case "servicios":
        drawServicesTable(doc, context.services, context.mode);
        break;

      case "vouchers":
        drawVouchersBlock(doc, context.vouchers);
        break;

      case "operadores":
        drawOperatorsBlock(doc, context.operators);
        break;

      case "totales":
        if (context.mode === "full") {
          const total = context.services.reduce((acc, s) => acc + Number(s.subtotal || 0), 0);

          doc.fontSize(12).text("Totales", { underline: true });
          doc.text(`Total: ${total.toFixed(2)}`);
          doc.moveDown();
        }
        break;

      case "observaciones":
        doc.fontSize(12).text("Observaciones", { underline: true });
        doc.text(contenido.texto || "-");
        doc.moveDown();
        break;

      default:
        doc.fontSize(10).text(`[Sección desconocida: ${tipo}]`);
        doc.moveDown();
    }
  });

  drawFooterBlock(doc, context.branding);
}

/* ===============================
   COMPONENTES VISUALES
================================ */

function drawHeader(doc, branding = DEFAULT_BRANDING) {
  const headerLogoPath = resolveAssetPath(branding.logo_path, defaultLogoPath);

  const logoX = 50;
  const logoY = 40;
  const logoWidth = 120;
  const infoX = 200;
  const titleY = 50;

  let logoBottomY = logoY;
  let textBottomY = titleY;

  try {
    if (headerLogoPath && fs.existsSync(headerLogoPath)) {
      doc.image(headerLogoPath, logoX, logoY, { width: logoWidth });
      logoBottomY = logoY + 90;
    }
  } catch (err) {
    console.error("HEADER LOGO ERROR:", err);
  }

  doc.fontSize(18).text(
    branding.company_name || DEFAULT_BRANDING.company_name,
    infoX,
    titleY
  );

  const infoLines = [
    branding.company_email || DEFAULT_BRANDING.company_email,
    branding.company_phone || DEFAULT_BRANDING.company_phone,
    branding.company_address || "",
    branding.company_website || ""
  ].filter(Boolean);

  let currentY = 78;
  infoLines.forEach(line => {
    doc.fontSize(10).text(line, infoX, currentY);
    currentY += 18;
  });

  textBottomY = currentY;

  const lineY = Math.max(logoBottomY, textBottomY) + 12;

  doc.moveTo(50, lineY).lineTo(550, lineY).stroke();

  doc.y = lineY + 15;
}
function drawProposalIntro(doc, branding, quote, trip, client) {
  ensureSpace(doc, 260);

  const coverPath = resolveAssetPath(branding.cover_image_path, null);

  if (coverPath && fs.existsSync(coverPath)) {
    try {
      doc.image(coverPath, 50, doc.y, {
        width: 500,
        height: 150
      });
      doc.y += 165;
    } catch (err) {
      console.error("COVER IMAGE ERROR:", err);
    }
  }

  doc.moveDown(0.3);

  doc.fontSize(20).text(
    (quote?.titulo || "Cotización de servicios").toUpperCase(),
    50,
    doc.y,
    { width: 500, align: "left" }
  );

  doc.moveDown(0.4);

  const subtitle = trip?.destino || "";
  if (subtitle) {
    doc.fontSize(14).text(subtitle, {
      width: 500,
      align: "left"
    });
    doc.moveDown(0.2);
  }

  const fecha = formatDateForPdf(quote?.fecha_creacion);
  if (fecha && fecha !== "-") {
    doc.fontSize(11).text(fecha, {
      width: 500,
      align: "left"
    });
    doc.moveDown(0.8);
  }

  const saludoNombre = client?.nombre || "cliente";
  doc.fontSize(11).text(`Hola ${saludoNombre}.`, {
    width: 500,
    align: "left"
  });
  doc.moveDown(0.4);

  doc.fontSize(10).text(
    "Te compartimos a continuación el detalle de la cotización solicitada, con los servicios, condiciones y observaciones correspondientes.",
    {
      width: 500,
      align: "left"
    }
  );
  doc.moveDown(1);
}

function drawQuoteBlock(doc, quote, mode) {
  doc.fontSize(12).text("Datos del presupuesto", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10)
    .text(`Título: ${quote?.titulo || "-"}`)
    .text(`Fecha de creación: ${formatDateForPdf(quote?.fecha_creacion)}`)
    .text(`Estado: ${quote?.estado || "-"}`)
    .text(`Tipo de documento: ${mode === "full" ? "PDF detallado" : "PDF parcial"}`);

  if (mode === "full") {
    doc.text(`Total estimado: ${Number(quote?.total || 0).toFixed(2)}`);
  }

  doc.moveDown();
}

function drawClientBlock(doc, client) {
  doc.fontSize(12).text("Datos del pasajero", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10)
    .text(`Nombre: ${client?.nombre || "-"}`)
    .text(`Email: ${client?.email || "-"}`)
    .text(`Teléfono: ${client?.telefono || "-"}`);

  if (client?.location) {
    doc.text(`Ciudad / País: ${client.location}`);
  }

  doc.moveDown();
}

function drawTripBlock(doc, trip) {
  doc.fontSize(12).text("Datos del viaje", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10)
    .text(`Destino: ${trip?.destino || "-"}`)
    .text(`Fecha inicio: ${formatDateForPdf(trip?.fecha_inicio)}`)
    .text(`Fecha fin: ${formatDateForPdf(trip?.fecha_fin)}`)
    .text(`Pasajeros / cantidad: ${trip?.pasajero || "-"}`)
    .text(`Estado del viaje: ${trip?.estado || "-"}`);

  if (trip?.notas) {
    doc.text(`Notas del viaje: ${trip.notas}`);
  }

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

  services.forEach((s, index) => {
    const metadata = normalizeMetadata(s.metadata);
    const precioAdulto = metadata.precio_adulto ?? s.precio_adulto ?? s.precio ?? 0;
    const precioMenor = metadata.precio_menor ?? s.precio_menor ?? 0;

    doc.fontSize(10).text(`${index + 1}. ${capitalize(s.categoria || s.tipo || "-")}`);
    doc.fontSize(10).text(`Descripción: ${s.descripcion || "-"}`);

    if (s.observaciones) {
      doc.text(`Observaciones: ${s.observaciones}`);
    }

    doc.text(`Moneda: ${s.moneda || "-"}`);
    doc.text(`Adultos: ${Number(s.adultos || 0)} | Menores: ${Number(s.menores || 0)}`);

    if (mode === "full") {
      doc.text(`Precio adulto: ${s.moneda || "-"} ${Number(precioAdulto || 0).toFixed(2)}`);
      doc.text(`Precio menor: ${s.moneda || "-"} ${Number(precioMenor || 0).toFixed(2)}`);
      doc.text(`Subtotal: ${s.moneda || "-"} ${Number(s.subtotal || 0).toFixed(2)}`);
    }

    drawServiceMetadata(doc, s.categoria || s.tipo, metadata);
    doc.moveDown();
  });
}

function drawServiceMetadata(doc, tipo, metadata = {}) {
  const lines = [];

  if (tipo === "hotel") {
    if (metadata.field_0) lines.push(`Check-in: ${metadata.field_0}`);
    if (metadata.field_1) lines.push(`Check-out: ${metadata.field_1}`);
  }

  if (tipo === "aereo") {
    if (metadata.field_0) lines.push(`Aerolínea: ${metadata.field_0}`);
    if (metadata.field_1) lines.push(`Vuelo: ${metadata.field_1}`);
    if (metadata.field_2) lines.push(`Fecha/hora: ${metadata.field_2}`);
    if (metadata.field_3) lines.push(`Origen/Destino: ${metadata.field_3}`);
  }

  if (tipo === "tren") {
    if (metadata.field_0) lines.push(`Fecha/hora: ${metadata.field_0}`);
    if (metadata.field_1) lines.push(`Lugar salida/llegada: ${metadata.field_1}`);
  }

  if (tipo === "auto") {
    if (metadata.field_0) lines.push(`Proveedor: ${metadata.field_0}`);
    if (metadata.field_1) lines.push(`Vehículo: ${metadata.field_1}`);
    if (metadata.field_2) lines.push(`Coberturas: ${metadata.field_2}`);
  }

  if (!lines.length) return;

  lines.forEach(line => {
    doc.fontSize(9).text(`• ${line}`);
  });
}

function drawVouchersBlock(doc, vouchers) {
  if (!vouchers?.length) return;

  ensureSpace(doc, 120);

  doc.fontSize(12).text("Vouchers y pasajes visibles", { underline: true });
  doc.moveDown(0.5);

  vouchers.forEach((v, index) => {
    doc.fontSize(10)
      .text(`${index + 1}. ${v.tipo || "-"}`)
      .text(`Servicio: ${v.servicio || "-"}`)
      .text(`Proveedor: ${v.proveedor || "-"}`)
      .text(`Fecha asociada: ${formatDateForPdf(v.fecha_asociada)}`);

    if (v.notes) {
      doc.text(`Notas: ${v.notes}`);
    }

    doc.moveDown();
  });
}

function drawOperatorsBlock(doc, operators) {
  if (!operators?.length) return;

  ensureSpace(doc, 120);

  doc.fontSize(12).text("Operadores vinculados", { underline: true });
  doc.moveDown(0.5);

  operators.forEach((o, index) => {
    doc.fontSize(10)
      .text(`${index + 1}. ${o.nombre || "-"}`)
      .text(`Tipo de servicio: ${o.tipo_servicio || "-"}`)
      .text(`Contacto: ${o.contacto || "-"}`)
      .text(`Email: ${o.email || "-"}`)
      .text(`Teléfono: ${o.telefono || "-"}`)
      .text(`Estado: ${o.estado || "-"}`);

    if (o.condiciones_comerciales) {
      doc.text(`Condiciones: ${o.condiciones_comerciales}`);
    }

    if (o.notes) {
      doc.text(`Notas: ${o.notes}`);
    }

    doc.moveDown();
  });
}

function drawLegalBlock(doc, quote) {
  if (!quote?.condicion_legal) return;

  ensureSpace(doc, 100);

  doc.fontSize(12).text("Condición legal", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text(quote.condicion_legal);
  doc.moveDown();
}

function drawFooterBlock(doc, branding = DEFAULT_BRANDING) {
  const footerLines = [];

  if (branding.pdf_footer) footerLines.push(branding.pdf_footer);
  if (branding.company_website) footerLines.push(branding.company_website);

  if (!footerLines.length) return;

  ensureSpace(doc, 80);

  doc.moveDown(1);
  doc.fontSize(9).text(footerLines.join(" | "), {
    align: "center"
  });
  doc.moveDown();
}

/* ===============================
   HELPERS
================================ */

function normalizeMetadata(metadata) {
  if (!metadata) return {};

  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }

  if (typeof metadata === "object") {
    return metadata;
  }

  return {};
}

function formatDateForPdf(value) {
  if (!value) return "-";
  const raw = String(value);
  if (raw.includes("T")) return raw.split("T")[0];
  if (raw.includes(" ")) return raw.split(" ")[0];
  return raw;
}

function capitalize(value) {
  const str = String(value || "");
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function ensureSpace(doc, needed = 120) {
  if (doc.y > doc.page.height - needed) {
    doc.addPage();
  }
}