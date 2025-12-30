// scripts/seedAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

async function upsertAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@kwanza.com';
  const senhaPlano = process.env.ADMIN_PASSWORD || 'Admin@123';

  try {
    console.log('> Sincronizando DB...');
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    const { Usuario } = db;

    let usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      console.log(`> Criando admin padrão: ${email}`);
      const senhaCriptografada = await bcrypt.hash(senhaPlano, 10);
      usuario = await Usuario.create({
        nome: 'Admin',
        email,
        senha: senhaCriptografada,
        tipo: 'admin',
      });
    } else {
      console.log('> Admin já existe, garantindo tipo e senha atualizados');
      const updates = {};
      if (usuario.tipo !== 'admin') updates.tipo = 'admin';
      // Atualiza a senha para o valor do .env se ADMIN_PASSWORD estiver setado
      if (process.env.ADMIN_PASSWORD) {
        updates.senha = await bcrypt.hash(senhaPlano, 10);
      }
      if (Object.keys(updates).length) await usuario.update(updates);
    }

    console.log('> Admin pronto:');
    console.log({ email, senha: senhaPlano });
  } catch (err) {
    console.error('Erro ao criar/atualizar admin:', err.message);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close().catch(() => {});
  }
}

upsertAdmin();
