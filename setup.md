# OpenSprint Setup Guide

## 🚀 Quick Setup (Your Backend is Ready!)

Your OpenSprint application now has both frontend and backend capabilities. Here's how to run it:

### **Development Mode**
```bash
# Set environment variables (Windows PowerShell)
$env:DATABASE_URL="file:./dev.db"
$env:JWT_SECRET="your-super-secure-jwt-secret-key-here-make-it-32-chars-or-more"
$env:NODE_ENV="development"

# Start both frontend and backend
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173 (React/Vite)
- **Backend**: http://localhost:3001 (Express API)

### **Production - Simple Deployment (SQLite)**
```bash
# Build the application
npm run build

# Set production environment
$env:DATABASE_URL="file:./production.db"
$env:JWT_SECRET="your-production-jwt-secret-32-chars-min"
$env:NODE_ENV="production"

# Start production server
npm start
```

### **Production - Enterprise Deployment (Docker)**
```bash
# Simple single-container deployment
docker compose -f docker-compose.simple.yml up -d

# Enterprise multi-service deployment
docker compose up -d
```

## 🏢 Architecture Comparison

### **Simple Mode (Perfect for Startups/Personal)**
- **Database**: SQLite (file-based, zero setup)
- **Authentication**: JWT-based login
- **Deployment**: Single Docker container
- **Storage**: Local file system
- **Monitoring**: Basic console logging

### **Enterprise Mode (Production Ready)**
- **Database**: PostgreSQL + Redis cache
- **Authentication**: JWT + SSO integration points
- **Deployment**: Multi-container with load balancer
- **Storage**: Object storage integration
- **Monitoring**: Full observability stack
- **Security**: Rate limiting, audit logs, RBAC

## 🔧 Configuration Options

All configuration is done via environment variables:

```bash
# Database
DATABASE_URL="file:./dev.db"                    # SQLite
# DATABASE_URL="postgresql://user:pass@host/db" # PostgreSQL

# Authentication
JWT_SECRET="your-32-char-secret"
AUTH_MODE="simple"                              # simple|oidc|saml|disabled

# Demo Mode (for hosted demos)
DEMO_MODE=false                                 # true for public demos
DEMO_USERNAME="demo"                            # demo login username
DEMO_PASSWORD="demo"                            # demo login password
DEMO_USER_EMAIL="demo@opensprint.io"           # demo user email

# Features (Enterprise)
FEATURE_AUDIT_LOG=false                         # true for compliance
FEATURE_WEBHOOKS=false                          # true for integrations
FEATURE_CUSTOM_WORKFLOWS=false                  # true for flexibility

# Security
RATE_LIMIT_MAX=1000                             # requests per 15min
```

## 📊 What You Get

### **Immediate Value**
- ✅ Full Kanban board with drag & drop
- ✅ Issue creation, editing, assignment
- ✅ Timeline view with status indicators
- ✅ Backlog management with priorities
- ✅ Real-time dashboard statistics
- ✅ Dark/light theme support

### **Enterprise Ready**
- ✅ REST API for integrations
- ✅ Database-backed persistence
- ✅ User authentication system
- ✅ Role-based access control foundation
- ✅ Docker containerization
- ✅ Health checks and monitoring

## 🎯 Next Steps

1. **Try it out**: `npm run dev` and visit http://localhost:5173
2. **Create issues**: Use the "Create Issue" tab
3. **Use the board**: Drag issues between columns
4. **Explore features**: Timeline, Backlog, Dashboard

## 🔄 Migration Path

```
Phase 1: Local Development (SQLite)
    ↓
Phase 2: Small Team (Docker + SQLite)
    ↓
Phase 3: Growing Team (Docker + PostgreSQL)
    ↓
Phase 4: Enterprise (Kubernetes + External Services)
```

Each phase uses the **same codebase** - just different configuration!

## 🤝 Why This Approach Works

- **Developers**: Easy to understand and contribute to
- **Startups**: Deploy in minutes, scale when needed
- **Enterprises**: Full feature set without vendor lock-in
- **Open Source**: No artificial limitations or premium tiers

Your OpenSprint instance can grow from a weekend project to an enterprise deployment without changing a single line of code - just configuration. 