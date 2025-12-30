const { Usuario, Endereco } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { supabase } = require("../utils/supabaseClient");

function mapSupabaseAuthErrorToMensagem(err) {
  const msg = String(err?.message || "").toLowerCase();
  if (msg.includes("invalid login")) return "Email ou senha inválidos";
  if (msg.includes("email not confirmed")) return "Confirme o email antes de entrar";
  if (msg.includes("too many")) return "Muitas tentativas. Tente novamente mais tarde.";
  return err?.message || "Falha na autenticação";
}

// Login com controlo de tentativas e último acesso
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  // número máximo de tentativas falhadas antes de bloquear
  const MAX_TENTATIVAS = 5;
  // minutos de bloqueio após exceder o limite
  const BLOQUEIO_MINUTOS = 15;

  try {
    if (!supabase) {
      return res.status(500).json({ mensagem: "Supabase não configurado no servidor" });
    }

    let usuario = null;
    if (email) {
      usuario = await Usuario.findOne({ where: { email } });
    }

    if (usuario && usuario.ativo === false) {
      return res.status(403).json({ mensagem: "Usuário inativo. Contacte o administrador." });
    }

    // Verificar se o utilizador está temporariamente bloqueado
    if (usuario && usuario.bloqueado_ate) {
      const agora = new Date();
      const ate = new Date(usuario.bloqueado_ate);
      if (agora < ate) {
        return res.status(403).json({
          mensagem: "Conta temporariamente bloqueada devido a várias tentativas falhadas. Tente novamente mais tarde.",
        });
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data?.session) {
      if (usuario) {
        const atuais = Number(usuario.tentativas_falhas || 0) + 1;
        const updatePayload = { tentativas_falhas: atuais };
        if (atuais >= MAX_TENTATIVAS) {
          const ate = new Date();
          ate.setMinutes(ate.getMinutes() + BLOQUEIO_MINUTOS);
          updatePayload.bloqueado_ate = ate;
        }
        try {
          await usuario.update(updatePayload);
        } catch (_) {}
      }

      const mensagem = error ? mapSupabaseAuthErrorToMensagem(error) : "Email ou senha inválidos";
      return res.status(401).json({ mensagem });
    }

    const sbUser = data.user;
    if (!sbUser?.email) {
      return res.status(500).json({ mensagem: "Falha ao obter usuário do Supabase" });
    }

    if (!usuario) {
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      usuario = await Usuario.create({
        nome: sbUser.user_metadata?.nome || sbUser.user_metadata?.full_name || sbUser.email,
        sobrenome: sbUser.user_metadata?.sobrenome || null,
        telefone: sbUser.user_metadata?.telefone || null,
        email: sbUser.email,
        senha: senhaCriptografada,
        tipo: sbUser.user_metadata?.tipo || "cliente",
        id_funcionario: sbUser.user_metadata?.id_funcionario || null,
        ativo: true,
      });
    }

    // Login bem-sucedido: reset tentativas e regista último acesso
    try {
      await usuario.update({
        tentativas_falhas: 0,
        bloqueado_ate: null,
        ultimo_acesso: new Date(),
      });
    } catch (_) {}

    const safeUser = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      id_funcionario: usuario.id_funcionario,
      ativo: usuario.ativo,
      ultimo_acesso: usuario.ultimo_acesso,
      avatar: usuario.avatar,
    };

    res.json({
      mensagem: "Login bem-sucedido",
      token: data.session.access_token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Erro ao tentar login:", err);
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Registro
exports.register = async (req, res) => {
  const { nome, sobrenome, telefone, email, senha, tipo, id_funcionario } = req.body;

  try {
    if (!supabase) {
      return res.status(500).json({ mensagem: "Supabase não configurado no servidor" });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ mensagem: "Email já registrado" });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome: nome || null,
          sobrenome: sobrenome || null,
          telefone: telefone || null,
          tipo: tipo || "cliente",
          id_funcionario: id_funcionario || null,
        },
      },
    });

    if (error) {
      return res.status(400).json({ mensagem: mapSupabaseAuthErrorToMensagem(error) });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      sobrenome,
      telefone,
      email,
      senha: senhaCriptografada,
      tipo: tipo || "cliente",
      id_funcionario: id_funcionario || null,
      ativo: true,
    });

    const payloadUser = {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      tipo: novoUsuario.tipo,
      id_funcionario: novoUsuario.id_funcionario,
      ativo: novoUsuario.ativo,
    };

    const session = data?.session;
    res.status(201).json({
      mensagem: session ? "Usuário criado com sucesso" : "Usuário criado. Verifique o email para confirmar a conta.",
      token: session ? session.access_token : null,
      user: payloadUser,
    });
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

exports.criarUsuarioComEndereco = async (req, res) => {
  try {
    const {
      nome,
      sobrenome,
      telefone,
      email,
      senha,
      casa, // rua
      municipio,
      tipo,
    } = req.body;

    // Verificar se email já existe
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ mensagem: "Email já registrado" });
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await Usuario.create({
      nome,
      sobrenome,
      telefone,
      email,
      senha: senhaCriptografada,
      tipo: tipo || "cliente",
    });

    // Criar endereço associado
    const endereco = await Endereco.create({
      rua: casa,
      bairro: "Centro",
      municipio,
      provincia: "Luanda",
      id_usuario: usuario.id,
    });

    res.status(201).json({ usuario, endereco });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar usuário com endereço" });
  }
};
// exports.criarUsuarioComEndereco = async (req, res) => {
//   try {
//     const { nome, email, senha, tipo, rua, bairro, municipio, provincia } =
//       req.body;

//     // Primeiro, cria o usuário
//     const usuario = await Usuario.create({
//       nome,
//       email,
//       senha,
//       tipo: tipo || "cliente",
//     });

//     // Depois, cria o endereço ligado ao usuário
//     const endereco = await Endereco.create({
//       rua,
//       bairro,
//       municipio,
//       provincia,
//       id_usuario: usuario.id, // vincula ao usuário criado
//     });

//     res.status(201).json({
//       usuario,
//       endereco,
//     });
//   } catch (error) {

exports.getAllUsers = async (req, res) => {
  const where = {};
  const { tipo } = req.query || {};
  if (tipo) {
    where.tipo = tipo;
  }
  const users = await Usuario.findAll({ where });
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await Usuario.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const user = await Usuario.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const { senha, ...rest } = req.body || {};
  let dadosUpdate = { ...rest };
  try {
    if (typeof senha === "string" && senha.trim()) {
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      dadosUpdate.senha = senhaCriptografada;
    }
    await user.update(dadosUpdate);
    res.json(user);
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ mensagem: "Erro ao atualizar usuário" });
  }
};

exports.deleteUser = async (req, res) => {
  const user = await Usuario.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  try {
    await user.update({ ativo: false });
    res.json({ message: "Usuário desativado com sucesso" });
  } catch (err) {
    console.error("Erro ao desativar usuário:", err);
    res.status(500).json({ mensagem: "Erro ao desativar usuário" });
  }
};

// Retorna usuário autenticado
exports.me = async (req, res) => {
  try {
    const { id } = req.user || {};
    if (!id) return res.status(401).json({ mensagem: "Não autenticado" });
    const user = await Usuario.findByPk(id);
    if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });
    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      id_funcionario: user.id_funcionario,
      ativo: user.ativo,
      ultimo_acesso: user.ultimo_acesso,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("Erro em /me:", err);
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Atualiza dados básicos do próprio usuário
exports.updateMe = async (req, res) => {
  try {
    const { id } = req.user || {};
    if (!id) return res.status(401).json({ mensagem: "Não autenticado" });

    const user = await Usuario.findByPk(id);
    if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    const { nome, email, telefone, nif } = req.body || {};

    if (nome !== undefined) user.nome = nome;
    if (email !== undefined) user.email = email;
    if (telefone !== undefined) user.telefone = telefone;
    if (nif !== undefined && user.nif !== undefined) user.nif = nif;

    await user.save();

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      nif: user.nif,
    });
  } catch (err) {
    console.error("Erro em updateMe:", err);
    res.status(500).json({ mensagem: "Erro ao atualizar perfil" });
  }
};

// Altera a senha do próprio usuário
exports.changePasswordMe = async (req, res) => {
  try {
    const { id } = req.user || {};
    if (!id) return res.status(401).json({ mensagem: "Não autenticado" });

    const { senha_atual, senha_nova } = req.body || {};
    if (!senha_atual || !senha_nova) {
      return res.status(400).json({ mensagem: "Senha atual e nova senha são obrigatórias" });
    }

    const user = await Usuario.findByPk(id);
    if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    const ok = await bcrypt.compare(senha_atual, user.senha);
    if (!ok) {
      return res.status(400).json({ mensagem: "Senha atual incorreta" });
    }

    const hash = await bcrypt.hash(senha_nova, 10);
    user.senha = hash;
    await user.save();

    res.json({ mensagem: "Senha atualizada com sucesso" });
  } catch (err) {
    console.error("Erro em changePasswordMe:", err);
    res.status(500).json({ mensagem: "Erro ao atualizar senha" });
  }
};

// Configuração de upload para avatar (ficheiros em public/uploads/avatars)
const avatarDir = path.join(__dirname, "..", "public", "uploads", "avatars");
fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = `user_${(req.user && req.user.id) || Date.now()}`;
    cb(null, base + ext);
  },
});

const uploadAvatar = multer({ storage: avatarStorage }).single("avatar");

// Upload do avatar do próprio usuário
exports.uploadAvatarMe = (req, res) => {
  uploadAvatar(req, res, async (err) => {
    if (err) {
      console.error("Erro no upload de avatar:", err);
      return res.status(400).json({ mensagem: "Erro ao enviar imagem" });
    }

    if (!req.file) {
      return res.status(400).json({ mensagem: "Nenhuma imagem enviada" });
    }

    try {
      const { id } = req.user || {};
      if (!id) return res.status(401).json({ mensagem: "Não autenticado" });

      const user = await Usuario.findByPk(id);
      if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });

      const relPath = `/uploads/avatars/${req.file.filename}`;
      // Se o modelo tiver campo avatar, atualiza. Caso contrário, apenas retorna a URL.
      if (user.avatar !== undefined) {
        user.avatar = relPath;
        await user.save();
      }

      res.json({ avatarUrl: relPath });
    } catch (e) {
      console.error("Erro ao processar avatar:", e);
      res.status(500).json({ mensagem: "Erro ao processar imagem" });
    }
  });
};
