import { validateServiceSchema } from "./servicios.schema.validator.js";

export function validateServicio(body) {

  if (!body.cotizacion_id) throw new Error("cotizacion_id requerido");
  if (!body.tipo) throw new Error("tipo requerido");

  if (body.precio && isNaN(body.precio))
    throw new Error("precio inválido");

  if (body.adultos && isNaN(body.adultos))
    throw new Error("adultos inválido");

  if (body.data_json) {
    validateServiceSchema(body.tipo, body.data_json);
  }
}
