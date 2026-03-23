const ALLOWED = [
  "application/pdf",
  "image/jpeg",
  "image/png"
];

export function validateFile(file) {

  if (!file) return;

  if (!ALLOWED.includes(file.mimetype))
    throw new Error("Tipo de archivo no permitido");

  if (file.size > 5 * 1024 * 1024)
    throw new Error("Archivo demasiado grande");
}
