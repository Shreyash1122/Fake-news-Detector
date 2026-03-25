import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: "6mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-fake-news-detector" });
});

app.use("/api/analyze", analyzeRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: "Something went wrong while analyzing this article. Please retry."
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
