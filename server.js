// server.js
const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

const DB_PATH = "./tokens.json";

app.use(express.json());

function loadTokens() {
  if (!fs.existsSync(DB_PATH)) return {};
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveTokens(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.get("/validar", (req, res) => {
  const token = (req.query.token || "").trim();
  if (!token) return res.json({ ok: false });

  const tokens = loadTokens();
  const info = tokens[token];
  if (!info) return res.json({ ok: false });

  const now = Date.now();
  if (now > info.expiraEm) return res.json({ ok: false });

  return res.json({ ok: true, expiraEm: info.expiraEm });
});

app.post("/liberar", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token obrigatório." });

  const tokens = loadTokens();
  const expiraEm = Date.now() + 7 * 24 * 60 * 60 * 1000;
  tokens[token] = { expiraEm };
  saveTokens(tokens);

  return res.json({ ok: true, expiraEm });
});

app.listen(PORT, () => {
  console.log(`✅ NoTrace Token Server ON — Porta ${PORT}`);
});
