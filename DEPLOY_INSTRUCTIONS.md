# 🚀 Deploy Instructions for SGP MCP Server

## Git Repository Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository:
   - **Repository name**: `sgp-mcp-server`
   - **Description**: `MCP Server for SGP (Sistema de Gestão para Provedores) API integration`
   - **Visibility**: Public ✅
   - **Initialize**: Don't initialize (we have files already)

2. Copy the repository URL (e.g., `https://github.com/yourusername/sgp-mcp-server.git`)

### 2. Push to GitHub

```bash
# Navigate to project directory
cd "/Users/thiagobarroncas/MCP Server/sgp-mcp-server"

# Add remote origin (replace with your GitHub URL)
git remote add origin https://github.com/yourusername/sgp-mcp-server.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Configure Repository Settings

In your GitHub repository settings:

1. **About Section**:
   - Description: `MCP Server for SGP API integration with multi-auth, caching, and HTTP/MCP interfaces`
   - Website: `https://yourusername.github.io/sgp-mcp-server` (if you want GitHub Pages)
   - Topics: `mcp`, `sgp`, `api`, `integration`, `provider-management`, `typescript`, `nodejs`

2. **Security**:
   - Enable "Vulnerability alerts"
   - Enable "Dependabot security updates"

3. **Features**:
   - ✅ Issues
   - ✅ Projects
   - ✅ Wiki
   - ✅ Discussions (optional)

## 🌐 Public Hosting Options

### Option 1: Cloudflare Workers (Recommended - Free)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to cloudflare directory
cd cloudflare

# Set your SGP credentials
wrangler secret put SGP_BASE_URL
wrangler secret put SGP_API_TOKEN

# Deploy to production
wrangler deploy --env production
```

**Your public URL**: `https://sgp-mcp-server.yourusername.workers.dev`

### Option 2: VPS Deployment

```bash
# On your VPS (Ubuntu/Debian)
sudo apt update
sudo apt install -y nodejs npm nginx

# Clone repository
git clone https://github.com/yourusername/sgp-mcp-server.git
cd sgp-mcp-server

# Install dependencies
npm install

# Build application
npm run build

# Configure environment
cp .env.example .env
nano .env  # Edit with your SGP credentials

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start dist/http/index.js --name sgp-mcp-server
pm2 startup
pm2 save

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/sgp-mcp-server
```

**Nginx configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sgp-mcp-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Optional: Configure SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: Railway.app (Easy Deploy)

1. Fork your GitHub repository
2. Go to [Railway.app](https://railway.app)
3. Connect your GitHub account
4. Deploy from repository
5. Set environment variables in Railway dashboard

### Option 4: Render.com (Free Tier)

1. Go to [Render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:http`
   - **Environment**: Set your SGP credentials

## 📝 Repository Documentation

### Update README.md

Update the repository URL in `package.json` and `README.md`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/sgp-mcp-server.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/sgp-mcp-server/issues"
  },
  "homepage": "https://github.com/yourusername/sgp-mcp-server#readme"
}
```

### Create GitHub Pages (Optional)

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs` (if you create a docs folder)
4. Your documentation will be available at: `https://yourusername.github.io/sgp-mcp-server`

## 🔐 Security Best Practices

### Environment Variables

Never commit these to Git:
- `SGP_USERNAME`
- `SGP_PASSWORD`
- `SGP_API_TOKEN`

### GitHub Secrets (for CI/CD)

If you set up GitHub Actions:
1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets for deployment credentials

## 📊 Monitoring & Analytics

### GitHub Insights

Monitor your repository:
- **Traffic**: See clones and visits
- **Issues**: Track bug reports and feature requests
- **Pull Requests**: Community contributions

### Production Monitoring

For deployed servers:
- **Cloudflare**: Analytics dashboard
- **VPS**: Use PM2 monitoring: `pm2 monit`
- **Uptime monitoring**: Use services like UptimeRobot

## 🤝 Community Guidelines

### Contributing

Create `CONTRIBUTING.md`:
```markdown
# Contributing to SGP MCP Server

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## Development Setup

\`\`\`bash
git clone https://github.com/yourusername/sgp-mcp-server.git
cd sgp-mcp-server
npm install
cp .env.example .env
npm run dev
\`\`\`
```

### Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`

## 🚀 Success Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] Public hosting configured (Cloudflare/VPS/etc.)
- [ ] Environment variables secured
- [ ] Documentation updated with correct URLs
- [ ] Repository topics and description set
- [ ] Security features enabled
- [ ] Monitoring configured

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community Q&A
- **Documentation**: Complete API docs at `/docs` endpoint

---

**Repository URL**: https://github.com/thiagojbs/sgp-mcp-server
**Live Demo**: https://sgp-mcp-server.thiagojbs.workers.dev
**API Docs**: https://sgp-mcp-server.thiagojbs.workers.dev/docs