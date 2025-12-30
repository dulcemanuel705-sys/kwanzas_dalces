# Kwanza Manipulus - Sistema de Gestão

## Descrição
Sistema completo de gestão empresarial desenvolvido com Node.js, Express e MySQL.

## Tecnologias
- **Backend**: Node.js, Express.js
- **Database**: MySQL com Sequelize ORM
- **Authentication**: JWT
- **File Upload**: Multer
- **Security**: bcryptjs

## Instalação Local

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+
- npm

### Passos
1. Clone o repositório
2. Copie `.env.example` para `.env`
3. Configure as variáveis de ambiente
4. Instale dependências: `npm install`
5. Importe o banco de dados: `mysql -u root -p < bd_kz.sql`
6. Inicie o servidor: `npm start`

## Configuração de Ambiente
Variáveis obrigatórias em `.env`:
- `DB_NAME`: Nome do banco de dados
- `DB_USER`: Usuário MySQL
- `DB_PASSWORD`: Senha MySQL
- `DB_HOST`: Host do banco
- `JWT_SECRET`: Chave secreta JWT

## Deploy com Docker

### Build da Imagem
```bash
docker build -t kwanza-manipulus .
```

### Executar Container
```bash
docker run -p 3000:3000 --env-file .env kwanza-manipulus
```

### Com Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - db
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql
volumes:
  mysql_data:
```

## Scripts Disponíveis
- `npm start`: Inicia servidor produção
- `npm run dev`: Inicia servidor desenvolvimento
- `npm run seed:admin`: Cria usuário admin

## Estrutura do Projeto
- `/controllers`: Lógica de negócio
- `/models`: Models Sequelize
- `/routes`: Rotas da API
- `/middlewares`: Middlewares de autenticação
- `/public`: Arquivos estáticos
- `/scripts`: Scripts utilitários

## Segurança
- Senhas criptografadas com bcrypt
- Tokens JWT para autenticação
- CORS configurado
- Upload de arquivos validado

## API Endpoints
- `/api/users`: Gestão de usuários
- `/api/clientes`: Gestão de clientes
- `/api/projectos`: Gestão de projetos
- `/api/financas`: Gestão financeira

## Licença
MIT
