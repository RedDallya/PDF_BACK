export function validateServiceSchema(tipo, data) {

  switch (tipo) {

    case "hotel":
      if (!data.hotel) throw new Error("Hotel requerido");
      if (!data.checkin) throw new Error("Checkin requerido");
      if (!data.checkout) throw new Error("Checkout requerido");
      break;

    case "aereo":
      if (!data.aerolinea) throw new Error("Aerolínea requerida");
      if (!data.vuelo) throw new Error("Vuelo requerido");
      break;

    case "traslado":
      if (!data.origen) throw new Error("Origen requerido");
      if (!data.destino) throw new Error("Destino requerido");
      break;

    default:
      break;
  }
}
