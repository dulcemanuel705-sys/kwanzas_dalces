const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { supabase } = require('../utils/supabaseClient');

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : null;

  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  if (!supabase) {
    return res.status(500).json({ mensagem: 'Supabase não configurado no servidor' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
    }

    const sbUser = data.user;
    const email = sbUser.email;
    if (!email) {
      return res.status(401).json({ mensagem: 'Token inválido' });
    }

    let usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      const randomSecret = `${sbUser.id}:${Date.now()}:${Math.random()}`;
      const senhaCriptografada = await bcrypt.hash(randomSecret, 10);
      usuario = await Usuario.create({
        nome: sbUser.user_metadata?.nome || sbUser.user_metadata?.full_name || email,
        sobrenome: sbUser.user_metadata?.sobrenome || null,
        telefone: sbUser.user_metadata?.telefone || null,
        email,
        senha: senhaCriptografada,
        tipo: sbUser.user_metadata?.tipo || 'cliente',
        id_funcionario: sbUser.user_metadata?.id_funcionario || null,
        ativo: true,
      });
    }

    if (usuario.ativo === false) {
      return res.status(403).json({ mensagem: 'Usuário inativo. Contacte o administrador.' });
    }

    req.supabaseUser = sbUser;
    req.user = {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      id_funcionario: usuario.id_funcionario,
      supabase_id: sbUser.id,
    };

    next();
  } catch (err) {
    console.error('Erro no auth:', err);
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
};
