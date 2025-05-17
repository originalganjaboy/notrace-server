const express = require("express");
const fs = require("fs");
const fetch = require("node-fetch"); // Importa fetch no Node.js
const app = express();
const PORT = process.env.PORT || 3000;

const DB_PATH = "./tokens.json";

app.use(express.json());

// Lê tokens do arquivo
function loadTokens() {
  if (!fs.existsSync(DB_PATH)) return {};
  return JSON.parse(fs.readFileSync(DB_PATH));
}

// Salva tokens no arquivo
function saveTokens(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Valida token
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

// Cria/ativa token (via webhook ou manual)
app.post("/liberar", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token obrigatório." });

  const tokens = loadTokens();
  const expiraEm = Date.now() + 7 * 24 * 60 * 60 * 1000;
  tokens[token] = { expiraEm };
  saveTokens(tokens);

  return res.json({ ok: true, expiraEm });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`✅ NoTrace Token Server ON — Porta ${PORT}`);
});

// ⚡ Ping automático a cada 10 minutos pra evitar que Render durma
setInterval(() => {
  fetch("https://notrace-server.onrender.com/validar?token=pulse")
    .then(() => console.log("🟢 Ping enviado pra manter vivo"))
    .catch(() => console.warn("⚠️ Falha ao enviar ping"));
}, 1000 * 60 * 10); // 10 minutos
