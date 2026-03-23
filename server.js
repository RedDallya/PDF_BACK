import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

/* ROUTES */
import viajesRoutes from "./routes/viajes.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import clientDocumentsRoutes from "./routes/clientDocuments.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import cotizacionesRoutes from "./routes/cotizaciones.routes.js";
import serviciosRoutes from "./routes/servicios.routes.js";

/* INIT */
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

/* MIDDLEWARES */
app.use(cors({
  origin: [
    "https://pdfcostaazul.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));

app.use(express.json());

/* STATIC */
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* API */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/clientes", clientsRoutes);
app.use("/api/viajes", viajesRoutes);
app.use("/api/cotizaciones", cotizacionesRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/client-documents", clientDocumentsRoutes);
app.use("/api/pdfs", pdfRoutes);

/* HEALTH */
app.get("/", (_, res) => {
  res.status(200).send("Backend funcionando 🚀");
});

/* ERRORS */
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

/* START */
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
