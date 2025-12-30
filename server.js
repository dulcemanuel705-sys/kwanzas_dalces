// server.js
require("dotenv").config();
const app = require("./app");
const db = require("./models");

const PORT = process.env.PORT || 3000;

async function waitForDatabase(maxTries = 5) {
  let attempt = 0;
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  while (attempt < maxTries) {
    try {
      if (attempt > 0) console.log(`⏳ Tentando conectar ao DB (tentativa ${attempt + 1}/${maxTries})...`);
      await db.sequelize.authenticate();
      // Sincronizar modelos (cria tabelas que não existem, mas não altera as existentes)
      await db.sequelize.sync();
      console.log("📦 DB conectado e sincronizado");
      return true;
    } catch (err) {
      console.error("❗ Falha ao conectar ao DB:", err?.message || err);
      attempt++;
      if (attempt >= maxTries) return false;
      // Backoff simples
      await delay(500 * Math.pow(2, attempt - 1));
    }
  }
}

(async () => {
  const ok = await waitForDatabase();
  if (!ok) {
    console.error("🚫 Não foi possível conectar ao banco de dados. Verifique MySQL/variáveis do .env.");
    // Ainda iniciamos o servidor para servir estáticos e permitir observabilidade
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
})();
