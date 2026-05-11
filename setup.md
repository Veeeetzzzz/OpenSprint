# OpenSprint Setup Guide

## Quick Setup

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

### **Production - Docker**
```bash
# SQLite deployment with a persisted volume
docker compose up -d
```

## Architecture

### **Current Runtime**
- **Database**: SQLite (file-based, zero setup)
- **Authentication**: JWT-based login
- **Deployment**: Single Docker container
- **Monitoring**: Basic console logging

PostgreSQL, Redis, SSO, object storage, and audit logging are roadmap items.

## 🔧 Configuration Options

All configuration is done via environment variables:

```bash
# Database
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-32-char-secret"
AUTH_MODE="simple"

# Demo Mode (for hosted demos)
DEMO_MODE=false                                 # true for public demos
DEMO_USERNAME="demo"                            # demo login username
DEMO_PASSWORD="demo"                            # demo login password
DEMO_USER_EMAIL="demo@opensprint.io"           # demo user email

# Reserved feature flags
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

### **Backend**
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
Phase 2: Docker + SQLite volume backups
    ↓
Phase 3: PostgreSQL migration support
    ↓
Phase 4: External services and SSO
```

Later phases require implementation work; they are not configuration-only today.

## 🤝 Why This Approach Works

- **Developers**: Easy to understand and contribute to
- **Startups**: Deploy in minutes, scale when needed
- **Teams**: Self-hosted issue tracking without vendor lock-in
- **Open Source**: No artificial limitations or premium tiers

OpenSprint is now scoped as a reliable SQLite-backed application first, with enterprise capabilities tracked as future work.
