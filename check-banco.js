const db = require('./models');
const { FinancaBanco } = require('./models');

async function checkBanco() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Verificar se a tabela existe
    const tableExists = await db.sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('financa_bancos'));
    
    console.log('Tabela financa_bancos existe?', tableExists);
    
    if (tableExists) {
      // Contar registros
      const count = await FinancaBanco.count();
      console.log(`Total de bancos cadastrados: ${count}`);
      
      // Listar os 10 primeiros bancos
      const bancos = await FinancaBanco.findAll({
        limit: 10,
        order: [['id', 'ASC']]
      });
      
      console.log('\nLista de bancos:');
      console.table(bancos.map(b => ({
        id: b.id,
        banco: b.banco,
        agencia: b.agencia,
        conta: b.conta,
        saldo: b.saldo
      })));
      
      // Verificar se o banco com ID 11 existe
      if (count >= 11) {
        const banco11 = await FinancaBanco.findByPk(11);
        console.log('\nBanco com ID 11:', banco11 ? 'Existe' : 'Não existe');
      } else {
        console.log(`\nO banco com ID 11 não existe. O maior ID existente é ${count}.`);
      }
    }
    
  } catch (error) {
    console.error('Erro ao acessar o banco de dados:', error);
  } finally {
    await db.sequelize.close();
  }
}

checkBanco();
