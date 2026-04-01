import { ClientModel } from "../models/client.model.js";
import { TagModel } from "../models/tag.model.js";

/*
===========================
CREATE CLIENT
===========================
*/
export const createClient = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // 1. Crear cliente con ownership
    const clientId = await ClientModel.create({
      ...req.body,
      created_by: userId
    });

    // 2. Guardar tags
    const tags =
      typeof req.body.tags === "string"
        ? req.body.tags.split(",").map(t => t.trim()).filter(Boolean)
        : [];

    if (tags.length) {
      await TagModel.saveClientTags(clientId, tags);
    }

    // 3. Obtener cliente
    const client = await ClientModel.getById(clientId);

    res.status(201).json(client);
  } catch (error) {
    console.error("CREATE CLIENT ERROR:", error);
    res.status(500).json({ error: "Error creando cliente" });
  }
};

/*
===========================
GET ALL CLIENTS
===========================
*/
export const getClients = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const clients = await ClientModel.getAll();

    res.json(clients);
  } catch (error) {
    console.error("GET CLIENTS ERROR:", error);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
};

/*
===========================
GET CLIENT BY ID
===========================
*/
export const getClientById = async (req, res) => {
  try {
    const userId = req.user?.id;

    const client = await ClientModel.getById(req.params.id);

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(client);
  } catch (error) {
    console.error("GET CLIENT BY ID ERROR:", error);
    res.status(500).json({ error: "Error obteniendo cliente" });
  }
};

/*
===========================
UPDATE CLIENT
===========================
*/
export const updateClient = async (req, res) => {
  try {
    const userId = req.user?.id;

    await ClientModel.update(req.params.id, req.body, userId);

    const tags =
      typeof req.body.tags === "string"
        ? req.body.tags.split(",").map(t => t.trim()).filter(Boolean)
        : [];

    await TagModel.saveClientTags(req.params.id, tags);

    const client = await ClientModel.getById(req.params.id);

    res.json(client);
  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error);
    res.status(500).json({ error: "Error actualizando cliente" });
  }
};

/*
===========================
DELETE CLIENT
===========================
*/
export const deleteClient = async (req, res) => {
  try {
    const userId = req.user?.id;

    await ClientModel.remove(req.params.id, userId);

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE CLIENT ERROR:", error);
    res.status(500).json({ error: "Error eliminando cliente" });
  }
};