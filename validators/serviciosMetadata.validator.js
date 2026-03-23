import { metadataSchemas } from "./metadata.schemas.js";

export function validateMetadata(tipo, metadata) {

  const schema = metadataSchemas[tipo];

  if (!schema) return;

  for (const field of schema) {
    if (!(field in metadata)) {
      throw new Error(`Metadata faltante: ${field}`);
    }
  }
}
