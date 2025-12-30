# SSL Certificate Setup

## Self-Signed Certificate (Development)
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=AO/ST=Luanda/L=Luanda/O=Kwanza Manipulus/CN=localhost"
```

## Let's Encrypt (Production)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Certificate Files Required
- `cert.pem` - SSL certificate
- `key.pem` - Private key

Place these files in the nginx/ssl/ directory.
