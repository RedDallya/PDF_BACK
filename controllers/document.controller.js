import { DocumentModel } from "../models/document.model.js";

export const createDocument = async (req, res) => {
  try {
    const { viaje_id, titulo, condicion_legal, estado } = req.body;

    if (!viaje_id) {
      return res.status(400).json({ error: "viaje_id obligatorio" });
    }

    const id = await DocumentModel.create({
      viaje_id,
      titulo,
      condicion_legal,
      estado
    });

    res.status(201).json({ id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando documento" });
  }
};

export const getDocumentsByViaje = async (req, res) => {
  try {
    const docs = await DocumentModel.getByViaje(req.params.viaje_id);
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo documentos" });
  }
};

export const updateDocument = async (req, res) => {
  try {
    await DocumentModel.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando documento" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    await DocumentModel.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error eliminando documento" });
  }
};
