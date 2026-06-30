import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "./lib/prisma.js";
import { devRouter } from "./routes/dev.js";
import { studentsRouter } from "./routes/students.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.resolve(__dirname, "../../assets");

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());
app.use("/assets", express.static(assetsPath));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", app: "ClassCrest", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/students", studentsRouter);
app.use("/api/dev", devRouter);

app.listen(port, () => {
  console.log(`ClassCrest API listening on http://localhost:${port}`);
});
