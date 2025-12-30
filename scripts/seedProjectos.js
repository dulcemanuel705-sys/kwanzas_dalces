require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Configuração da conexão com a base de dados (usando as mesmas configurações do teu projeto)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// Definição dos modelos (simplificados para o seed)
// Inclui os campos principais usados na tabela projectos.html
const Projecto = sequelize.define('Projecto', {
  // Identificação do projecto
  projectId: { type: DataTypes.STRING, allowNull: false },

  // Cliente
  cliente: { type: DataTypes.STRING, allowNull: false },

  // Descrição
  descricao: { type: DataTypes.TEXT, allowNull: false },
  jobDescription: { type: DataTypes.TEXT },

  // Datas
  dataInicio: { type: DataTypes.DATEONLY },
  dataFim: { type: DataTypes.DATEONLY },
  dataInicioEstimada: { type: DataTypes.DATEONLY },
  dataFimEstimada: { type: DataTypes.DATEONLY },

  // Status geral do projecto
  jobStatus: { type: DataTypes.STRING },

  // Valores financeiros principais
  valorCotacao: { type: DataTypes.DECIMAL(10, 2) },
  valorTotalOrcamento: { type: DataTypes.DECIMAL(10, 2) },
  valorTotalContrato: { type: DataTypes.DECIMAL(10, 2) }
});

const ServiceTicket = sequelize.define('ServiceTicket', {
  notaServico: { type: DataTypes.INTEGER, primaryKey: true },
  notaExecutado: { type: DataTypes.STRING },
  notaEnviado: { type: DataTypes.STRING },
  notaPago: { type: DataTypes.STRING },
  descricao: { type: DataTypes.TEXT },
  dataInicio: { type: DataTypes.DATEONLY },
  dataFim: { type: DataTypes.DATEONLY },
  responsavel: { type: DataTypes.STRING },
  estado: { type: DataTypes.STRING, defaultValue: 'Planeado' }
});

// Relacionamentos
Projecto.hasMany(ServiceTicket, { foreignKey: 'projecto_id' });
ServiceTicket.belongsTo(Projecto, { foreignKey: 'projecto_id' });

// Dados de exemplo
// Cada projecto preenche as colunas usadas na tabela de projectos.html:
// Project_ID (projectId), Cliente (cliente), Descrição_Projeto (jobDescription),
// Data_Inicio_Estimada (dataInicioEstimada), Data_Fim_Estimada (dataFimEstimada),
// Status_Geral (jobStatus), Valor_Total_Orçamento (valorTotalOrcamento),
// Valor_Total_Contrato (valorTotalContrato)
const projectosExemplo = [
  {
    projectId: 'MS-20250115-0001',
    cliente: 'Empresa A',
    descricao: 'Desenvolvimento de Website Corporativo',
    jobDescription: 'Desenvolvimento de Website Corporativo',
    dataInicio: '2025-01-15',
    dataFim: '2025-03-30',
    dataInicioEstimada: '2025-01-15',
    dataFimEstimada: '2025-03-30',
    jobStatus: 'Em andamento',
    valorCotacao: 25000.00,
    valorTotalOrcamento: 25000.00,
    valorTotalContrato: 28000.00,
    ServiceTickets: [
      { notaServico: 1001, descricao: 'Design UI/UX', dataInicio: '2025-01-20', dataFim: '2025-02-10', responsavel: 'Ana Silva', estado: 'Concluído' },
      { notaServico: 1002, descricao: 'Desenvolvimento Frontend', dataInicio: '2025-02-11', dataFim: '2025-03-10', responsavel: 'Carlos Mendes', estado: 'Em andamento' },
      { notaServico: 1003, descricao: 'Backend e Integração', dataInicio: '2025-03-11', dataFim: '2025-03-25', responsavel: 'João Pereira', estado: 'Planeado' }
    ]
  },
  {
    projectId: 'MS-20250201-0002',
    cliente: 'Empresa B',
    descricao: 'Sistema de Gestão de Inventário',
    jobDescription: 'Sistema de Gestão de Inventário',
    dataInicio: '2025-02-01',
    dataFim: '2025-05-30',
    dataInicioEstimada: '2025-02-01',
    dataFimEstimada: '2025-05-30',
    jobStatus: 'Planeado',
    valorCotacao: 45000.00,
    valorTotalOrcamento: 45000.00,
    valorTotalContrato: 50000.00,
    ServiceTickets: [
      { notaServico: 2001, descricao: 'Análise de Requisitos', dataInicio: '2025-02-05', dataFim: '2025-02-20', responsavel: 'Maria Santos', estado: 'Concluído' },
      { notaServico: 2002, descricao: 'Modelagem do Banco de Dados', dataInicio: '2025-02-21', dataFim: '2025-03-10', responsavel: 'Pedro Alves', estado: 'Concluído' },
      { notaServico: 2003, descricao: 'Desenvolvimento Módulo Principal', dataInicio: '2025-03-11', dataFim: '2025-04-15', responsavel: 'Ana Silva', estado: 'Em andamento' },
      { notaServico: 2004, descricao: 'Testes e Validação', dataInicio: '2025-04-16', dataFim: '2025-05-10', responsavel: 'João Pereira', estado: 'Planeado' },
      { notaServico: 2005, descricao: 'Treinamento e Implantação', dataInicio: '2025-05-11', dataFim: '2025-05-25', responsavel: 'Carlos Mendes', estado: 'Planeado' }
    ]
  },
  {
    projectId: 'MS-20250315-0003',
    cliente: 'Empresa C',
    descricao: 'Aplicativo Móvel de Varejo',
    jobDescription: 'Aplicativo Móvel de Varejo',
    dataInicio: '2025-03-15',
    dataFim: '2025-06-30',
    dataInicioEstimada: '2025-03-15',
    dataFimEstimada: '2025-06-30',
    jobStatus: 'Em andamento',
    valorCotacao: 35000.00,
    valorTotalOrcamento: 35000.00,
    valorTotalContrato: 39000.00,
    ServiceTickets: [
      { notaServico: 3001, descricao: 'Prototipagem e Design', dataInicio: '2025-03-20', dataFim: '2025-04-05', responsavel: 'Ana Silva', estado: 'Em andamento' },
      { notaServico: 3002, descricao: 'Desenvolvimento iOS', dataInicio: '2025-04-06', dataFim: '2025-05-15', responsavel: 'Carlos Mendes', estado: 'Planeado' },
      { notaServico: 3003, descricao: 'Desenvolvimento Android', dataInicio: '2025-04-06', dataFim: '2025-05-15', responsavel: 'João Pereira', estado: 'Planeado' },
      { notaServico: 3004, descricao: 'Integração com Backend', dataInicio: '2025-05-16', dataFim: '2025-06-10', responsavel: 'Maria Santos', estado: 'Planeado' },
      { notaServico: 3005, descricao: 'Testes e Publicação', dataInicio: '2025-06-11', dataFim: '2025-06-25', responsavel: 'Pedro Alves', estado: 'Planeado' }
    ]
  },
  {
    projectId: 'MS-20250110-0004',
    cliente: 'Empresa D',
    descricao: 'Migração para Nuvem',
    jobDescription: 'Migração para Nuvem',
    dataInicio: '2025-01-10',
    dataFim: '2025-02-28',
    dataInicioEstimada: '2025-01-10',
    dataFimEstimada: '2025-02-28',
    jobStatus: 'Concluído',
    valorCotacao: 28000.00,
    valorTotalOrcamento: 28000.00,
    valorTotalContrato: 30000.00,
    ServiceTickets: [
      { notaServico: 4001, descricao: 'Análise de Infraestrutura', dataInicio: '2025-01-12', dataFim: '2025-01-20', responsavel: 'Pedro Alves', estado: 'Concluído' },
      { notaServico: 4002, descricao: 'Configuração de Ambientes', dataInicio: '2025-01-21', dataFim: '2025-02-05', responsavel: 'Maria Santos', estado: 'Concluído' },
      { notaServico: 4003, descricao: 'Migração de Dados', dataInicio: '2025-02-06', dataFim: '2025-02-20', responsavel: 'Carlos Mendes', estado: 'Em andamento' }
    ]
  },
  {
    projectId: 'MS-20250215-0005',
    cliente: 'Empresa E',
    descricao: 'Otimização de SEO e Marketing Digital',
    jobDescription: 'Otimização de SEO e Marketing Digital',
    dataInicio: '2025-02-15',
    dataFim: '2025-04-30',
    dataInicioEstimada: '2025-02-15',
    dataFimEstimada: '2025-04-30',
    jobStatus: 'Em andamento',
    valorCotacao: 12000.00,
    valorTotalOrcamento: 12000.00,
    valorTotalContrato: 13500.00,
    ServiceTickets: [
      { notaServico: 5001, descricao: 'Auditoria de SEO', dataInicio: '2025-02-16', dataFim: '2025-03-01', responsavel: 'Ana Silva', estado: 'Concluído' },
      { notaServico: 5002, descricao: 'Otimização de Conteúdo', dataInicio: '2025-03-02', dataFim: '2025-03-20', responsavel: 'João Pereira', estado: 'Em andamento' },
      { notaServico: 5003, descricao: 'Campanha de Links Patrocinados', dataInicio: '2025-03-21', dataFim: '2025-04-15', responsavel: 'Maria Santos', estado: 'Planeado' }
    ]
  }
];

// Função para popular a base de dados
async function popularBancoDeDados() {
  try {
    // Sincronizar modelos com o banco de dados (cria as tabelas se não existirem)
    await sequelize.sync({ force: true });
    console.log('Tabelas criadas com sucesso!');

    // Inserir projetos e tickets
    for (const projetoData of projectosExemplo) {
      const tickets = projetoData.ServiceTickets || [];
      delete projetoData.ServiceTickets;
      
      const projeto = await Projecto.create(projetoData);
      
      if (tickets.length > 0) {
        for (const ticket of tickets) {
          await ServiceTicket.create({
            ...ticket,
            projeto_id: projeto.id
          });
        }
      }
      
      console.log(`Projeto "${projeto.descricao}" criado com ${tickets.length} tickets.`);
    }
    
    console.log('\nDados de exemplo inseridos com sucesso!');
    console.log('Acesse a aplicação em: http://localhost:3000/projectos.html');
    
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    await sequelize.close();
  }
}

// Executar o script
popularBancoDeDados();
