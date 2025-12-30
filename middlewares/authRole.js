const { Usuario } = require('../models');

// roles pode ser string ou array de strings
module.exports = function authRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return async function (req, res, next) {
    try {
      const payload = req.user || {};
      let tipo = payload.tipo;

      if (!tipo && req.supabaseUser) {
        tipo = req.supabaseUser.user_metadata?.tipo || req.supabaseUser.app_metadata?.tipo;
      }

      if (!tipo && payload.id) {
        const u = await Usuario.findByPk(payload.id);
        if (!u) return res.status(401).json({ mensagem: 'Utilizador não encontrado' });
        tipo = u.tipo;
      }

      if (!tipo || !allowed.includes(tipo)) {
        return res.status(403).json({ mensagem: 'Permissão negada' });
      }

      next();
    } catch (err) {
      console.error('Erro no authRole:', err);
      return res.status(500).json({ mensagem: 'Erro de autorização' });
    }
  };
}
