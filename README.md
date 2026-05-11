# OpenSprint

**Open source issue tracker for Agile teams** - A self-hosted alternative to Jira/Atlassian.

Built with React, TypeScript, Node.js, Prisma, and SQLite.

<img width="1569" height="607" alt="image" src="https://github.com/user-attachments/assets/9cdc6184-552e-4fe8-9b4d-79361ec724bc" />


## ✨ Features

- **Kanban Board:** Drag & drop issue management with smooth animations
- **Issue Tracking:** Complete issue lifecycle management
- **Timeline View:** Visual project timeline with status indicators  
- **Backlog Management:** Prioritization and sprint planning
- **Dashboard:** Real-time project statistics and insights
- **Multi-tenancy:** Project-based organization
- **Responsive Design:** Works on desktop, tablet, and mobile

## Roadmap Toward Enterprise

### **Deployment**
- Single-container SQLite deployment
- Docker Compose with a persisted SQLite volume
- PostgreSQL, Redis, and Kubernetes are roadmap items, not supported runtime targets yet

### **Authentication**
- **Built-in:** Simple username/password
- **SSO:** SAML and OIDC are roadmap items

### **Security & Compliance**
- Role-based access control (RBAC)
- Audit logging is a roadmap item
- Rate limiting
- HTTPS/TLS support
- Compliance hardening is a roadmap item

## 🚀 Quick Start

### **Option 1: Simple Deployment (SQLite)**
```bash
# Clone and run with Docker
git clone https://github.com/yourusername/opensprint.git
cd opensprint
docker compose -f docker-compose.simple.yml up -d
```

### **Option 2: Development Setup**
```bash
# Install dependencies
npm install

# Set up database
cp .env.example .env
npx prisma generate
npx prisma db push

# Start development servers
npm run dev
```

### **Option 3: Demo Mode**
Demo mode still requires the SQLite database connection. It seeds a demo user, project, and issues at server startup.

```bash
# Required
JWT_SECRET=your-32-character-secret-key-here
DEMO_MODE=true

# Optional (customize demo credentials)
DEMO_USERNAME=demo
DEMO_PASSWORD=demo
DEMO_USER_EMAIL=demo@opensprint.io
DEMO_USER_NAME=Demo User
```

Demo credentials are `demo@opensprint.io` / `demo` by default.

## ⚙️ Configuration

### **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PROVIDER` | `sqlite` | Database type. Only `sqlite` is supported currently |
| `DATABASE_URL` | `file:./dev.db` | Database connection string |
| `AUTH_MODE` | `simple` | Auth mode. Only `simple` is implemented currently |
| `JWT_SECRET` | - | JWT signing secret (required) |
| `DEMO_MODE` | `false` | Enable demo login for hosted demos |
| `DEMO_USERNAME` | `demo` | Demo login username |
| `DEMO_PASSWORD` | `demo` | Demo login password |
| `DEMO_USER_EMAIL` | `demo@opensprint.io` | Demo user email |
| `FEATURE_AUDIT_LOG` | `false` | Reserved for future audit logging |
| `FEATURE_WEBHOOKS` | `false` | Reserved for future webhook integrations |

### **Current Runtime**

| Feature | Status |
|---------|--------|
| Database | SQLite |
| Authentication | Built-in JWT |
| Deployment | Single Node container |
| Monitoring | Health endpoint and console logs |
| Backup | SQLite file/volume backup |

## 🔧 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │◄──►│   Node.js API   │◄──►│     SQLite      │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
```

## 📊 Roadmap

### **v0.2.0 - Authentication & Multi-tenancy**
- [ ] User authentication system
- [ ] Project-based access control
- [ ] User management interface

### **v0.3.0 - Advanced Features**
- [ ] Custom workflows
- [ ] Time tracking
- [ ] Reports and analytics
- [ ] Email notifications

### **v1.0.0 - Enterprise**
- [ ] SSO integration (SAML/OIDC)
- [ ] Advanced permissions
- [ ] Audit trails
- [ ] API integrations
- [ ] Kubernetes deployment

## 🛠️ Development

### **Tech Stack**
- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** SQLite
- **Infrastructure:** Docker

### **Contributing**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Running Tests**
```bash
# Unit tests
npm test

# Lint
npm run lint

# Production build
npm run build
```

## 🔒 Security

- Report security vulnerabilities via GitHub issues
- Use HTTPS/TLS at the deployment edge for data in transit
- Keep dependencies updated and review security advisories
- SQLite files should be protected with host filesystem permissions and backups

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Community:** [GitHub Discussions](https://github.com/yourusername/opensprint/discussions)
- **Documentation:** [docs.opensprint.dev](https://docs.opensprint.dev)
- **Roadmap Questions:** [GitHub Discussions](https://github.com/yourusername/opensprint/discussions)

---

**Made with ❤️ for the open source community**
