import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "myri-api" });
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Myri API" });
});

const port = Number(process.env.PORT ?? 4001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`myri-api listening on :${port}`);
});
