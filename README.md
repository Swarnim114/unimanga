# UniManga - Manga Reading & Library Management Platform

[![CI Pipeline](https://github.com/Swarnim114/unimanga/actions/workflows/ci.yml/badge.svg)](https://github.com/Swarnim114/unimanga/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/Swarnim114/unimanga/actions/workflows/cd.yml/badge.svg)](https://github.com/Swarnim114/unimanga/actions/workflows/cd.yml)
[![Docker Image](https://img.shields.io/docker/v/swarnim114/unimanga-backend?label=docker)](https://hub.docker.com/r/swarnim114/unimanga-backend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern manga reading and library management application with a production-grade DevOps CI/CD pipeline.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [DevOps CI/CD Pipeline](#devops-cicd-pipeline)
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview...

UniManga is a full-stack application consisting of:
- **Mobile App**: React Native (Expo) mobile application for iOS and Android
- **Backend API**: Node.js (Express.js) RESTful API with MongoDB
- **DevOps Pipeline**: Production-grade CI/CD with security scanning and Kubernetes deployment

**Technology Stack:**
- Frontend: React Native, Expo, NativeWind (Tailwind CSS)
- Backend: Node.js 20, Express.js 5, MongoDB Atlas
- Infrastructure: Docker, Kubernetes (K3s), AWS EC2
- CI/CD: GitHub Actions, DockerHub

---

## ✨ Features

### Application Features
- 📚 **Manga Library Management**: Browse, save, and organize manga collections
- 🔐 **User Authentication**: JWT-based secure authentication
- 🌐 **Multi-Website Support**: Aggregation from multiple manga sources
- 📱 **Mobile First**: Native mobile experience with Expo
- 🎨 **Modern UI**: Beautiful interface with NativeWind/Tailwind CSS
- ⚡ **Fast & Responsive**: Optimized performance with caching

### DevOps Features
- 🔄 **Automated CI/CD**: Push-to-production workflow
- 🛡️ **Security Scanning**: SAST, SCA, and container vulnerability scanning
- 📦 **Containerization**: Multi-stage Docker builds with Alpine Linux
- ☸️ **Kubernetes Deployment**: Production-ready orchestration with K3s
- 🔒 **Secret Management**: Secure credential handling with GitHub Secrets
- 📊 **Quality Gates**: Automated linting, testing, and validation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────────────┐            ┌──────────────────┐          │
│  │   Mobile App     │            │   Web Browser    │          │
│  │   (React Native) │            │   (Future)       │          │
│  └────────┬─────────┘            └────────┬─────────┘          │
└───────────┼──────────────────────────────┼─────────────────────┘
            │                               │
            └───────────────┬───────────────┘
                            │
                     HTTPS (REST API)
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Application Layer                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Express.js API (Node.js 20)                    │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │    │
│  │  │  Auth    │  │ Library  │  │  Manga   │           │    │
│  │  │Controller│  │Controller│  │Controller│           │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │    │
│  │       │             │              │                  │    │
│  │  ┌────▼─────────────▼──────────────▼─────┐          │    │
│  │  │      Mongoose ODM / Models             │          │    │
│  │  └────────────────┬───────────────────────┘          │    │
│  └───────────────────┼────────────────────────────────────┘    │
└────────────────────┼──────────────────────────────────────────┘
                     │
              MongoDB Protocol
                     │
┌────────────────────▼──────────────────────────────────────────┐
│                     Data Layer                                 │
│  ┌──────────────────────────────────────────────────────┐    │
│  │           MongoDB Atlas (Cloud)                      │    │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │    │
│  │  │ Users  │  │ Manga  │  │Library │  │Category│   │    │
│  │  └────────┘  └────────┘  └────────┘  └────────┘   │    │
│  └──────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

---

## 🚀 DevOps CI/CD Pipeline

### Pipeline Overview

This project implements a **production-grade DevOps pipeline** with 8 mandatory CI stages and automated Kubernetes deployment.

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Developer   │─────>│   GitHub     │─────>│  CI Pipeline │
│  (git push)  │      │  Repository  │      │  (8 stages)  │
└──────────────┘      └──────────────┘      └──────┬───────┘
                                                    │
                                            ┌───────▼───────┐
                                            │ Security Scans│
                                            │ • SAST (CodeQL)
                                            │ • SCA (Snyk)  │
                                            │ • Trivy       │
                                            └───────┬───────┘
                                                    │
                                            ┌───────▼───────┐
                                            │   DockerHub   │
                                            │ (Trusted Image)
                                            └───────┬───────┘
                                                    │
                                            ┌───────▼───────┐
                                            │  CD Pipeline  │
                                            │  (Kubernetes) │
                                            └───────┬───────┘
                                                    │
                                            ┌───────▼───────┐
                                            │  Production   │
                                            │ AWS EC2 + K3s │
                                            └───────────────┘
```

### CI Pipeline Stages

| Stage | Tool | Purpose | Duration |
|-------|------|---------|----------|
| **1. Checkout** | GitHub Actions | Clone repository | 10s |
| **2. Setup** | Node.js 20 | Install runtime + cache deps | 30s |
| **3. Lint** | ESLint | Code quality & standards | 15s |
| **4. Test** | Node Test Runner | Unit tests | 20s |
| **5. SAST** | CodeQL | Static security analysis | 3-4 min |
| **6. SCA** | npm audit + Snyk | Dependency vulnerabilities | 1 min |
| **7. Build** | Docker | Multi-stage containerization | 2 min |
| **8. Scan** | Trivy | Container vulnerability scan | 1 min |
| **9. Smoke Test** | Docker + curl | Runtime validation | 30s |
| **10. Push** | DockerHub | Publish trusted image | 30s |

**Total CI Time:** 8-12 minutes

### CD Pipeline Stages

| Stage | Purpose | Duration |
|-------|---------|----------|
| **1. Apply ConfigMap** | Non-sensitive configuration | 5s |
| **2. Create Secret** | Inject credentials from GitHub Secrets | 5s |
| **3. Apply Deployment** | Deploy 2 replicas with health probes | 10s |
| **4. Apply Service** | Expose via NodePort 30001 | 5s |
| **5. Wait Rollout** | Verify deployment completion | 30-60s |
| **6. Verify Pods** | Check pod readiness | 20s |
| **7. Test API** | Health check validation | 10s |

**Total CD Time:** 2-3 minutes

### Security Layers

```
┌───────────────────────────────────────────────────────────┐
│  Layer 1: Code Quality     │ ESLint (standards)           │
│  Layer 2: Code Security    │ CodeQL (OWASP Top 10)       │
│  Layer 3: Dependencies     │ npm audit + Snyk (CVEs)     │
│  Layer 4: Container        │ Trivy (OS + library vulns)  │
│  Layer 5: Runtime          │ Smoke tests (validation)    │
│  Layer 6: Secrets          │ GitHub Secrets (encrypted)  │
│  Layer 7: Access Control   │ K8s RBAC (least privilege)  │
└───────────────────────────────────────────────────────────┘
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: 20.x LTS
- **npm**: 9.x or higher
- **Docker**: 20.x or higher (for containerization)
- **MongoDB Atlas Account**: Free tier available
- **GitHub Account**: For CI/CD pipeline
- **DockerHub Account**: For container registry
- **AWS Account**: (Optional) For Kubernetes deployment

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Swarnim114/unimanga.git
   cd unimanga
   ```

2. **Backend Setup**
   ```bash
   cd backend/api
   npm install
   cp .env.example .env  # Create from template
   # Edit .env with your MongoDB URI and JWT secret
   npm start
   ```

3. **Mobile App Setup**
   ```bash
   cd apps/mobile/my-app
   npm install
   npx expo start
   ```

---

## 💻 Running Locally

### Backend API

1. **Install Dependencies**
   ```bash
   cd backend/api
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in `backend/api/`:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unimanga?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

3. **Run Development Server**
   ```bash
   npm start
   # Or with nodemon for auto-reload
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Run Linting**
   ```bash
   npm run lint
   ```

### Using Docker

1. **Build Docker Image**
   ```bash
   cd backend/api
   docker build -t unimanga-backend:local .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name unimanga-backend \
     -p 3000:3000 \
     -e MONGODB_URI="your-mongodb-uri" \
     -e JWT_SECRET="your-jwt-secret" \
     -e PORT=3000 \
     unimanga-backend:local
   ```

3. **Test Container**
   ```bash
   curl http://localhost:3000/
   # Should return: Server is running!
   ```

### Mobile App

1. **Install Dependencies**
   ```bash
   cd apps/mobile/my-app
   npm install
   ```

2. **Start Expo Development Server**
   ```bash
   npx expo start
   ```

3. **Run on Emulator/Device**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on physical device

---

## 🚢 Deployment

### Docker Deployment

**Build and Push to DockerHub:**
```bash
# Build image
docker build -t swarnim114/unimanga-backend:latest backend/api

# Login to DockerHub
docker login

# Push image
docker push swarnim114/unimanga-backend:latest
```

### Kubernetes Deployment

**Prerequisites:**
- Kubernetes cluster (K3s, minikube, EKS, GKE, AKS)
- kubectl configured

**Deploy to Kubernetes:**

1. **Create Kubernetes Secret**
   ```bash
   kubectl create secret generic unimanga-backend-secret \
     --from-literal=MONGODB_URI="your-mongodb-uri" \
     --from-literal=JWT_SECRET="your-jwt-secret"
   ```

2. **Apply Manifests**
   ```bash
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

3. **Verify Deployment**
   ```bash
   kubectl get pods -l app=unimanga-backend
   kubectl get svc unimanga-backend
   ```

4. **Access Application**
   ```bash
   # Get NodePort
   kubectl get svc unimanga-backend -o jsonpath='{.spec.ports[0].nodePort}'
   
   # Access API (replace <NODE-IP> with your node's IP)
   curl http://<NODE-IP>:30001/
   ```

### AWS EC2 + K3s Deployment

**1. Provision EC2 Instance:**
```bash
# Launch t2.micro Ubuntu 24.04 instance
# Configure security group: Allow ports 22, 30001

# SSH into instance
ssh -i your-key.pem ubuntu@<EC2-IP>
```

**2. Install K3s:**
```bash
curl -sfL https://get.k3s.io | sh -
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
```

**3. Install GitHub Actions Runner:**
```bash
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
./config.sh --url https://github.com/Swarnim114/unimanga --token <YOUR-TOKEN>
sudo ./svc.sh install
sudo ./svc.sh start
```

**4. Deploy via CD Pipeline:**
- Push code to GitHub
- CI pipeline runs automatically
- CD pipeline deploys to K3s after CI success

---

## ⚙️ Configuration

### GitHub Secrets

Configure the following secrets in your GitHub repository:  
**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKERHUB_USERNAME` | DockerHub username | `swarnim114` |
| `DOCKERHUB_TOKEN` | DockerHub access token | `dckr_pat_...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `super-secret-key-change-this` |
| `SNYK_TOKEN` | (Optional) Snyk API token | `abc123...` |

**How to Get Tokens:**

1. **DockerHub Token:**
   - Login to [DockerHub](https://hub.docker.com/)
   - Account Settings → Security → New Access Token
   - Copy token (you'll only see it once)

2. **MongoDB URI:**
   - Login to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create cluster → Connect → Connect your application
   - Copy connection string, replace `<password>` with your password

3. **Snyk Token (Optional):**
   - Sign up at [Snyk](https://snyk.io/)
   - Account Settings → General → Auth Token
   - Copy API token

### Environment Variables

**Development (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/unimanga
JWT_SECRET=dev-secret-key
PORT=3000
NODE_ENV=development
```

**Production (Kubernetes Secret):**
```bash
kubectl create secret generic unimanga-backend-secret \
  --from-literal=MONGODB_URI="mongodb+srv://prod-uri" \
  --from-literal=JWT_SECRET="prod-secret-key"
```

### ESLint Configuration

Located at `backend/api/.eslintrc.json`:
```json
{
  "env": {
    "node": true,
    "es2020": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}
```

---

## 🧪 Testing

### Unit Tests

```bash
cd backend/api
npm test
```

**Test Structure:**
```javascript
// tests/api.test.js
import { test } from 'node:test';
import assert from 'node:assert';

test('Health endpoint returns OK', async () => {
  const response = await fetch('http://localhost:3000/');
  assert.strictEqual(response.ok, true);
});
```

### Integration Tests

```bash
# Start MongoDB (via Docker)
docker run -d -p 27017:27017 mongo:7

# Run integration tests
npm run test:integration
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/

# Using k6
k6 run load-test.js
```

---

## 📝 CI/CD Pipeline Explanation

### Why Each Stage Exists

#### 1. **Lint (ESLint)**
- **Purpose**: Enforce coding standards and catch syntax errors early
- **Risk Mitigated**: Technical debt, inconsistent code style, common bugs
- **Example**: Detects unused variables that could indicate logic errors

#### 2. **Unit Tests**
- **Purpose**: Validate business logic and prevent regressions
- **Risk Mitigated**: Breaking changes, logic errors, API contract violations
- **Example**: Ensures authentication middleware rejects invalid tokens

#### 3. **SAST (CodeQL)**
- **Purpose**: Detect security vulnerabilities in source code
- **Risk Mitigated**: SQL injection, XSS, command injection, path traversal
- **Example**: Identifies unsanitized user input used in database queries

#### 4. **SCA (npm audit + Snyk)**
- **Purpose**: Identify vulnerable dependencies and supply chain risks
- **Risk Mitigated**: Known CVEs in third-party packages, license violations
- **Example**: Detects Log4Shell-like vulnerabilities in dependencies

#### 5. **Docker Build**
- **Purpose**: Package application into portable, consistent container
- **Risk Mitigated**: Environment inconsistencies, deployment failures
- **Example**: Multi-stage build reduces image size and attack surface

#### 6. **Container Scan (Trivy)**
- **Purpose**: Scan container image for OS and library vulnerabilities
- **Risk Mitigated**: Vulnerable base images, outdated system packages
- **Example**: Detects critical CVEs in Alpine Linux packages

#### 7. **Smoke Test**
- **Purpose**: Validate container starts and behaves correctly
- **Risk Mitigated**: Runtime failures, missing environment variables
- **Example**: Ensures MongoDB connection succeeds before deployment

#### 8. **Push to Registry**
- **Purpose**: Publish trusted, scanned image for deployment
- **Risk Mitigated**: Deployment of untested or vulnerable images
- **Example**: Only images passing all gates reach DockerHub

### Pipeline Failure Scenarios

| Scenario | Stage | Action |
|----------|-------|--------|
| Syntax error in code | Lint | Build fails, developer notified |
| Test case fails | Unit Tests | Build fails, fix required |
| Critical CVE detected | SAST/SCA/Trivy | Build fails (or warning based on severity) |
| Container won't start | Smoke Test | Build fails, logs shown |
| MongoDB connection fails | Smoke Test | Build fails, check credentials |

### Continuous Deployment Flow

1. **CI Success** → Triggers CD pipeline via `workflow_run` event
2. **Checkout Code** → Pull latest Kubernetes manifests
3. **Apply Manifests** → Update ConfigMap, Secret, Deployment, Service
4. **Rolling Update** → Kubernetes gradually replaces old pods with new ones
5. **Health Checks** → Liveness and readiness probes validate new pods
6. **Traffic Switch** → Service routes traffic to healthy new pods
7. **Validation** → CD pipeline tests API endpoints
8. **Complete** → Old pods terminated, deployment successful

---

## 📊 Monitoring & Observability

### Health Checks

**Liveness Probe:**
```yaml
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```
- Checks if container is alive
- Kubernetes restarts pod if probe fails

**Readiness Probe:**
```yaml
readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```
- Checks if container is ready to serve traffic
- Kubernetes removes pod from service if not ready

### Viewing Logs

**Docker:**
```bash
docker logs unimanga-backend
docker logs -f unimanga-backend  # Follow logs
```

**Kubernetes:**
```bash
kubectl logs -l app=unimanga-backend
kubectl logs -f deployment/unimanga-backend  # Follow logs
kubectl logs <pod-name> --tail=100  # Last 100 lines
```

### Metrics

**Resource Usage:**
```bash
kubectl top pods -l app=unimanga-backend
kubectl top nodes
```

**Deployment Status:**
```bash
kubectl get deployment unimanga-backend
kubectl describe deployment unimanga-backend
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Write tests for new features
   - Ensure linting passes: `npm run lint`
   - Run tests: `npm test`
4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add user profile endpoint"
   ```
5. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

- **JavaScript**: ES2020+ syntax, async/await preferred
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Comments**: JSDoc for functions, inline comments for complex logic
- **Testing**: Unit tests for business logic, integration tests for APIs

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Expo Team**: For the amazing React Native framework
- **MongoDB Atlas**: For free-tier cloud database
- **GitHub Actions**: For free CI/CD for public repos
- **Aqua Security**: For Trivy container scanner
- **Snyk**: For dependency vulnerability scanning
- **CodeQL Team**: For static analysis capabilities

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Swarnim114/unimanga/issues)
- **Pull Requests**: [Contribute to the project](https://github.com/Swarnim114/unimanga/pulls)
- **Discussions**: [Ask questions or share ideas](https://github.com/Swarnim114/unimanga/discussions)

---

## 🗺️ Roadmap

### Phase 1: Core Features (Completed ✅)
- [x] Backend API with authentication
- [x] MongoDB integration
- [x] Mobile app with React Native
- [x] CI/CD pipeline with security scanning
- [x] Kubernetes deployment

### Phase 2: Enhanced Security (Planned)
- [ ] DAST (Dynamic Application Security Testing)
- [ ] Secret rotation automation
- [ ] Network policies
- [ ] Pod security standards

### Phase 3: Observability (Planned)
- [ ] Prometheus + Grafana metrics
- [ ] ELK stack for logging
- [ ] Distributed tracing with Jaeger
- [ ] Alerting (Slack/email)

### Phase 4: Advanced Deployment (Planned)
- [ ] Blue-green deployment strategy
- [ ] Canary deployments
- [ ] GitOps with ArgoCD
- [ ] Multi-environment (dev/staging/prod)

### Phase 5: Performance (Planned)
- [ ] Load testing automation
- [ ] Horizontal Pod Autoscaler
- [ ] Redis caching layer
- [ ] CDN integration

---

**Made with ❤️ for DevOps Excellence**

**Star ⭐ this repository if you found it helpful!**
