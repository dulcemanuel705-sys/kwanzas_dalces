// app.js
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const db = require("./models");

// Middlewares
app.use(cors());
// aumentar limites para suportar importações em massa (XLSX/CSV)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Diagnóstico: logar chamadas para bancos-catalogo
app.use((req, res, next) => {
  if (req.path.startsWith('/api/bancos-catalogo')) {
    console.log(`[ROUTE LOG] ${req.method} ${req.path}`);
  }
  next();
});

// Rotas
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/pagamentos", require("./routes/pagamentoRoutes"));
app.use("/api/tipopagamento", require("./routes/tipoPagamentoRoutes"));
app.use("/api/clientes", require("./routes/clientesRoutes"));
app.use("/api/fornecedores", require("./routes/fornecedorRoutes"));
app.use("/api/bancos-catalogo", require("./routes/bancosCatalogoRoutes"));
app.use("/api/financas/bancos", require("./routes/financaBancosRoutes"));
app.use("/api/financas", require("./routes/financaCoreRoutes"));
app.use("/api/empresa/funcionarios", require("./routes/empresaFuncionariosRoutes"));
app.use("/api/rh", require("./routes/rhRoutes"));
app.use("/api/projectos", require("./routes/projectoRoutes"));


// Rota raiz: entrega a página de login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check simples
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Sincronização do DB é feita no server.js (para evitar chamadas duplicadas)

module.exports = app;

