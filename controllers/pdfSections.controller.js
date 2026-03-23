import { PdfSectionModel } from "../models/pdfSection.model.js";

export const createSection = async (req, res) => {
  try {
    const id = await PdfSectionModel.create(req.body);
    res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando sección" });
  }
};

export const getSections = async (req, res) => {
  try {
    const data = await PdfSectionModel.getByCotizacion(req.params.cotizacion_id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo secciones" });
  }
};

export const updateSection = async (req, res) => {
  try {
    await PdfSectionModel.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando sección" });
  }
};

export const deleteSection = async (req, res) => {
  try {
    await PdfSectionModel.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando sección" });
  }
};
