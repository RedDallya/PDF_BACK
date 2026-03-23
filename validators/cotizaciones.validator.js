export function validateCotizacion(body) {

  if (!body.viaje_id)
    throw new Error("viaje_id requerido");

  if (!body.titulo)
    throw new Error("titulo requerido");

  if (body.fecha_creacion && isNaN(Date.parse(body.fecha_creacion)))
    throw new Error("fecha_creacion inválida");
}
