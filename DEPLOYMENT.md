# Guia de Deploy - Kwanza Manipulus

## Pré-requisitos
- Docker e Docker Compose
- Domínio configurado (para HTTPS)
- Servidor com mínimo 2GB RAM
- SSL Certificate (Let's Encrypt recomendado)

## Passo 1: Configurar Ambiente

### 1.1 Variáveis de Ambiente
```bash
cp .env.example .env
# Editar .env com configurações de produção
```

### 1.2 Certificado SSL
```bash
# Desenvolvimento (self-signed)
cd nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=AO/ST=Luanda/L=Luanda/O=Kwanza Manipulus/CN=seu-dominio.com"

# Produção (Let's Encrypt)
sudo certbot --nginx -d seu-dominio.com
```

## Passo 2: Deploy com Docker Compose

### 2.1 Iniciar Serviços
```bash
# Build e iniciar todos os serviços
docker-compose up -d --build

# Verificar status
docker-compose ps

# Verificar logs
docker-compose logs -f app
```

### 2.2 Configurar Banco de Dados
```bash
# Aguardar MySQL iniciar
docker-compose exec db mysql -u root -p

# Criar usuário e permissões
CREATE USER 'kwanza_user'@'%' IDENTIFIED BY 'senha_forte';
GRANT ALL PRIVILEGES ON fast_pizza.* TO 'kwanza_user'@'%';
FLUSH PRIVILEGES;
```

### 2.3 Criar Usuário Admin
```bash
docker-compose exec app npm run seed:admin
```

## Passo 3: Monitoramento

### 3.1 Acessar Painéis
- **Aplicação**: https://seu-dominio.com
- **Grafana**: http://seu-dominio.com:3001 (admin/admin123)
- **Prometheus**: http://seu-dominio.com:9090

### 3.2 Configurar Grafana
1. Login em Grafana
2. Add Data Source → Prometheus
3. URL: http://prometheus:9090
4. Import dashboard templates

## Passo 4: Manutenção

### 4.1 Backup
```bash
# Backup banco de dados
docker-compose exec db mysqldump -u root -p fast_pizza > backup_$(date +%Y%m%d).sql

# Backup uploads
tar -czf uploads_$(date +%Y%m%d).tar.gz public/uploads/
```

### 4.2 Atualizações
```bash
# Pull novas atualizações
git pull origin main

# Rebuild e restart
docker-compose down
docker-compose up -d --build
```

### 4.3 Logs e Monitoramento
```bash
# Logs da aplicação
docker-compose logs -f app

# Logs Nginx
docker-compose logs -f nginx

# Métricas em tempo real
curl http://localhost:9090/api/v1/query?query=up
```

## Configurações Avançadas

### Variáveis de Produção Opcionais
```bash
# .env adicional
NODE_ENV=production
LOG_LEVEL=warn
CORS_ORIGIN=https://seu-dominio.com
DB_HOST=db
REDIS_HOST=redis
```

### Performance Tuning
```bash
# Aumentar limites do sistema
echo 'vm.max_map_count=262144' >> /etc/sysctl.conf
sysctl -p

# Configurar swap se necessário
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

## Troubleshooting

### Problemas Comuns
1. **Container não inicia**: Verificar variáveis de ambiente
2. **Erro de conexão DB**: Verificar se MySQL está rodando
3. **HTTPS não funciona**: Verificar certificados SSL
4. **Upload falha**: Verificar permissões pasta uploads

### Comandos Úteis
```bash
# Reiniciar serviço específico
docker-compose restart app

# Entrar no container
docker-compose exec app sh

# Verificar recursos
docker stats

# Limpar recursos não usados
docker system prune -a
```

## Segurança

### Recomendações
- Usar senhas fortes
- Configurar firewall
- Ativar fail2ban
- Monitorar logs suspeitos
- Manter Docker atualizado

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
