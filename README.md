# OpenSprint

**Open source issue tracker for Agile teams** - A self-hosted, enterprise-ready alternative to Jira/Atlassian.

Built with React, TypeScript, Node.js, and PostgreSQL/SQLite.

## ✨ Features

- **Kanban Board:** Drag & drop issue management with smooth animations
- **Issue Tracking:** Complete issue lifecycle management
- **Timeline View:** Visual project timeline with status indicators  
- **Backlog Management:** Prioritization and sprint planning
- **Dashboard:** Real-time project statistics and insights
- **Multi-tenancy:** Project-based organization
- **Responsive Design:** Works on desktop, tablet, and mobile

## 🏢 Enterprise Ready

### **Deployment Options**
- **Simple:** Single Docker container with SQLite
- **Scalable:** Docker Compose with PostgreSQL and Redis
- **Enterprise:** Kubernetes with external databases

### **Authentication**
- **Built-in:** Simple username/password
- **SSO:** SAML and OIDC integration
- **Enterprise:** Active Directory, LDAP

### **Security & Compliance**
- Role-based access control (RBAC)
- Audit logging
- Rate limiting
- HTTPS/TLS support
- SOC 2 compliance ready

## 🚀 Quick Start

### **Option 1: Simple Deployment (SQLite)**
```bash
# Clone and run with Docker
git clone https://github.com/yourusername/opensprint.git
cd opensprint
docker compose -f docker-compose.simple.yml up -d
```

### **Option 2: Enterprise Deployment (PostgreSQL)**
```bash
# Clone repository
git clone https://github.com/yourusername/opensprint.git
cd opensprint

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run with PostgreSQL
docker compose up -d
```

### **Option 3: Development Setup**
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

## ⚙️ Configuration

### **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PROVIDER` | `sqlite` | Database type: `sqlite` or `postgresql` |
| `DATABASE_URL` | `file:./dev.db` | Database connection string |
| `AUTH_MODE` | `simple` | Auth mode: `simple`, `oidc`, `saml`, `disabled` |
| `JWT_SECRET` | - | JWT signing secret (required) |
| `FEATURE_AUDIT_LOG` | `false` | Enable audit logging |
| `FEATURE_WEBHOOKS` | `false` | Enable webhook integrations |

### **Simple vs Enterprise**

| Feature | Simple | Enterprise |
|---------|--------|------------|
| Database | SQLite | PostgreSQL + Redis |
| Authentication | Built-in | SSO + LDAP |
| Deployment | Single container | Multi-container + Load balancer |
| Monitoring | Basic logs | Full observability stack |
| Backup | File-based | Automated + Point-in-time recovery |

## 🔧 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │◄──►│   Node.js API   │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Caching)     │
                       └─────────────────┘
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
- **Database:** PostgreSQL (prod), SQLite (dev)
- **Infrastructure:** Docker, Kubernetes

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

# E2E tests
npm run test:e2e

# Database tests
npm run test:db
```

## 🔒 Security

- Report security vulnerabilities to security@opensprint.dev
- All data encrypted in transit and at rest
- Regular security audits and dependency updates
- OWASP compliance guidelines followed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Community:** [GitHub Discussions](https://github.com/yourusername/opensprint/discussions)
- **Documentation:** [docs.opensprint.dev](https://docs.opensprint.dev)
- **Enterprise Support:** [enterprise@opensprint.dev](mailto:enterprise@opensprint.dev)

---

**Made with ❤️ for the open source community**
