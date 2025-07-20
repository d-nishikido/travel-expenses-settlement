# Deployment Guide - Travel Expenses Settlement System

## Overview

This guide provides step-by-step instructions for deploying the Travel Expenses Settlement System to various environments (staging and production).

## Prerequisites

### Development Tools
- Docker and Docker Compose
- Node.js 18+
- pnpm 8+
- Git

### Infrastructure Requirements
- **Database**: PostgreSQL 16+
- **Reverse Proxy**: Nginx (recommended)
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)
- **Domain**: Configured DNS records

### Minimum Server Specifications
- **RAM**: 2GB minimum, 4GB recommended
- **CPU**: 2 cores minimum
- **Storage**: 20GB minimum, SSD recommended
- **OS**: Ubuntu 20.04+ or similar Linux distribution

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js and pnpm (if needed for builds)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

### 2. Application Setup

```bash
# Create application directory
sudo mkdir -p /opt/expense-app
sudo chown $USER:$USER /opt/expense-app
cd /opt/expense-app

# Clone repository
git clone <your-repository-url> .
git checkout main  # or your production branch

# Create logs directory
mkdir -p logs
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.production

# Edit environment variables
nano .env.production
```

#### Required Environment Variables

Update the following variables in `.env.production`:

```bash
# Database
DB_HOST=postgres  # or external database host
DB_PORT=5432
DB_USER=expense_user
DB_PASSWORD=SECURE_DATABASE_PASSWORD
DB_NAME=expense_db_prod
DATABASE_URL=postgresql://expense_user:SECURE_DATABASE_PASSWORD@postgres:5432/expense_db_prod

# Application
NODE_ENV=production
BACKEND_PORT=5000
FRONTEND_PORT=3000

# Security (CRITICAL: Change these!)
JWT_SECRET=YOUR_VERY_SECURE_JWT_SECRET_AT_LEAST_32_CHARACTERS
JWT_EXPIRES_IN=1d

# Frontend
VITE_API_URL=https://yourdomain.com/api

# Logging
LOG_LEVEL=warn
LOG_FORMAT=json
```

### 4. SSL Certificate Setup (Production)

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

## Deployment Methods

### Method 1: Docker Compose (Recommended)

This is the simplest method for small to medium deployments.

#### Build and Deploy

```bash
# Set environment
export NODE_ENV=production

# Validate environment variables
pnpm run validate:env

# Build Docker images
docker-compose -f docker/docker-compose.prod.yml build

# Start services
docker-compose -f docker/docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker/docker-compose.prod.yml ps

# View logs
docker-compose -f docker/docker-compose.prod.yml logs -f
```

#### Nginx Configuration for SSL

Create `/etc/nginx/sites-available/expense-app`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/expense-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Method 2: Manual Build Deployment

For environments where you build on the server:

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm run build

# Start with PM2 (recommended for Node.js apps)
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'expense-backend',
    script: './packages/backend/dist/index.js',
    cwd: '/opt/expense-app',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_file: './logs/backend-combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Method 3: GitHub Actions Automated Deployment

The project includes GitHub Actions workflows for automated deployment. Configure these secrets in your GitHub repository:

#### Required Secrets
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `DEPLOY_HOST`: Server IP or hostname
- `DEPLOY_USER`: SSH username
- `DEPLOY_SSH_KEY`: SSH private key for deployment
- `PRODUCTION_URL`: Production URL for health checks
- `STAGING_URL`: Staging URL for health checks

#### Manual Deployment Trigger
1. Go to Actions tab in GitHub
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select environment (staging/production)
5. Enter Docker image tag (or use "latest")

## Database Setup

### Initial Database Setup

```bash
# Connect to PostgreSQL container
docker exec -it expense-db-prod psql -U expense_user -d expense_db_prod

# Or connect to external database
psql -h your-db-host -U expense_user -d expense_db_prod
```

### Run Migrations

```sql
-- Create tables (run these in order)
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'accounting')),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense reports table
CREATE TABLE expense_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    trip_purpose TEXT NOT NULL,
    trip_start_date DATE NOT NULL,
    trip_end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid')),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense items table
CREATE TABLE expense_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('transportation', 'accommodation', 'meal', 'other')),
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    receipt_url VARCHAR(500),
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approval history table
CREATE TABLE approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'paid')),
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_expense_reports_user_id ON expense_reports(user_id);
CREATE INDEX idx_expense_reports_status ON expense_reports(status);
CREATE INDEX idx_expense_items_report_id ON expense_items(expense_report_id);
CREATE INDEX idx_approval_history_report_id ON approval_history(expense_report_id);
```

### Create Initial Admin User

```sql
-- Create admin user (change password!)
INSERT INTO users (email, password, name, role, department) 
VALUES (
    'admin@yourcompany.com',
    '$2b$10$hashedpassword',  -- Use bcrypt to hash the password
    'System Administrator',
    'accounting',
    'Finance'
);
```

## Health Checks and Monitoring

### Basic Health Check

```bash
# Check application health
curl https://yourdomain.com/api/health

# Check database connectivity
docker exec expense-db-prod pg_isready -U expense_user

# Check container status
docker-compose -f docker/docker-compose.prod.yml ps
```

### Log Monitoring

```bash
# View application logs
docker-compose -f docker/docker-compose.prod.yml logs -f backend
docker-compose -f docker/docker-compose.prod.yml logs -f frontend

# View system logs
sudo journalctl -u docker -f
```

### Monitoring Setup (Optional)

For production monitoring, consider setting up:

1. **Prometheus + Grafana**: For metrics and dashboards
2. **ELK Stack**: For log aggregation and analysis
3. **Uptime monitoring**: Services like UptimeRobot or Pingdom
4. **Error tracking**: Services like Sentry

## Backup and Recovery

### Database Backup

```bash
# Create backup script
cat > /opt/expense-app/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/expense-app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker exec expense-db-prod pg_dump -U expense_user expense_db_prod | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
EOF

chmod +x /opt/expense-app/backup.sh

# Schedule daily backups
echo "0 2 * * * /opt/expense-app/backup.sh" | crontab -
```

### Application Backup

```bash
# Backup application files
tar -czf /opt/backups/expense-app-$(date +%Y%m%d).tar.gz /opt/expense-app --exclude='node_modules' --exclude='logs'
```

## Rollback Procedures

### Docker Deployment Rollback

```bash
# List available images
docker images | grep expense

# Rollback to previous version
docker-compose -f docker/docker-compose.prod.yml down
docker tag expense-backend:previous expense-backend:latest
docker tag expense-frontend:previous expense-frontend:latest
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Database Rollback

```bash
# Restore from backup
gunzip -c /opt/expense-app/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | docker exec -i expense-db-prod psql -U expense_user -d expense_db_prod
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
docker-compose -f docker/docker-compose.prod.yml logs

# Check environment variables
docker-compose -f docker/docker-compose.prod.yml config

# Validate environment
pnpm run validate:env
```

#### 2. Database Connection Issues
```bash
# Test database connection
docker exec expense-db-prod pg_isready -U expense_user

# Check database logs
docker-compose -f docker/docker-compose.prod.yml logs postgres
```

#### 3. High Memory Usage
```bash
# Check container resource usage
docker stats

# Restart services if needed
docker-compose -f docker/docker-compose.prod.yml restart
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test nginx configuration
sudo nginx -t
```

### Performance Optimization

#### Database Optimization
```sql
-- Update table statistics
ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Application Optimization
```bash
# Enable gzip compression in nginx
# Add to server block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## Security Considerations

### 1. Environment Variables
- Never commit secrets to version control
- Use strong passwords and JWT secrets
- Rotate secrets regularly

### 2. Network Security
- Use HTTPS everywhere
- Configure firewall rules
- Limit database access to application servers only

### 3. Application Security
- Keep dependencies updated
- Regular security scans
- Monitor for vulnerabilities

### 4. Backup Security
- Encrypt backup files
- Store backups in secure location
- Test restore procedures regularly

## Support and Maintenance

### Regular Maintenance Tasks

#### Weekly
- [ ] Check application logs for errors
- [ ] Verify backup completion
- [ ] Monitor resource usage

#### Monthly
- [ ] Update Docker images
- [ ] Review security logs
- [ ] Update SSL certificates if needed
- [ ] Performance review

#### Quarterly
- [ ] Update dependencies
- [ ] Security audit
- [ ] Disaster recovery test
- [ ] Capacity planning review

### Getting Help

1. Check logs first: `docker-compose logs`
2. Review this documentation
3. Check GitHub issues
4. Contact development team

---

## Quick Reference

### Essential Commands

```bash
# Start application
docker-compose -f docker/docker-compose.prod.yml up -d

# Stop application
docker-compose -f docker/docker-compose.prod.yml down

# View logs
docker-compose -f docker/docker-compose.prod.yml logs -f

# Update application
git pull origin main
docker-compose -f docker/docker-compose.prod.yml build
docker-compose -f docker/docker-compose.prod.yml up -d

# Backup database
./backup.sh

# Check health
curl https://yourdomain.com/api/health
```

### Important File Locations

- Application: `/opt/expense-app`
- Logs: `/opt/expense-app/logs`
- Backups: `/opt/expense-app/backups`
- Nginx config: `/etc/nginx/sites-available/expense-app`
- SSL certificates: `/etc/letsencrypt/live/yourdomain.com/`