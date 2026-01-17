

# 📚 UniManga

**Unified Manga Tracker & Mobile Reader Overlay**

---

## 🎯 Project Overview

**UniManga** is a **mobile-first distributed application** that allows users to **track, organize, and read manga from multiple third-party websites** through a **single unified platform**.

The system is designed to demonstrate **mobile application development**, **backend APIs**, **real-time synchronization**, **caching**, and **DevOps practices**, while maintaining a **clear separation of concerns** between client, server, and infrastructure layers.

> UniManga **does not host, cache, scrape, or redistribute copyrighted content**.
> All manga content is rendered **directly from original sources inside an in-app WebView**, ensuring legal and ethical compliance.

---

## 🧠 Problem Statement

Users read manga across many websites, resulting in:

* Fragmented reading history
* No centralized progress tracking
* Poor mobile reading UX
* No cross-device synchronization

UniManga solves this by acting as a **reading companion**, not a content provider.

---

## 💡 Key Features (Academic Scope)

### 📱 Mobile Application (Primary Platform)

* In-app WebView reader
* Client-side reader overlay (dark mode, navigation)
* Offline-first reading progress storage
* Secure authentication
* Real-time progress synchronization

### 🌐 Backend Platform

* REST APIs for user and library management
* WebSocket-based real-time synchronization
* Redis-backed caching
* Background workers for async tasks
* Rate limiting and API gateway layer

### 🧪 DevOps & Infrastructure

* Dockerized services
* CI pipeline with GitHub Actions
* Horizontal scaling demonstration
* Centralized configuration and logging

---

## ⚙️ System Architecture (HLD)

```
Mobile App (React Native)
        ↓
API Gateway (Nginx / Middleware)
        ↓
Backend Services (Node.js)
 ├─ Auth & User Service
 ├─ Library & Progress Service
 ├─ Realtime Sync Service (WebSockets)
 ├─ Background Worker
        ↓
Storage Layer
 ├─ MongoDB (Primary DB)
 └─ Redis (Cache + Sessions)
```

---

## 🧰 Technology Stack

### 📱 Mobile App (React Native Course)

* **React Native (Expo) + TypeScript**
* **react-native-webview**
* **SQLite / WatermelonDB** (offline-first storage)
* **Expo SecureStore**
* **Expo Notifications** (optional)

Demonstrates:

* Mobile UI development
* Offline data handling
* Secure authentication
* Real-time synchronization

---

### 🧠 Backend API (System Design)

* **Node.js + Express + TypeScript**
* **MongoDB** (document-based storage)
* **Redis** (caching, sessions, rate limiting)
* **WebSockets (Socket.IO)**
* **JWT authentication**
* **Background jobs (BullMQ)**

Demonstrates:

* REST vs async communication
* Caching strategies
* Stateless services
* Event-driven design

---

### 🧪 DevOps & Infrastructure

* **Docker & Docker Compose**
* **Nginx (API Gateway + Load Balancer)**
* **GitHub Actions (CI)**
* **Environment-based configuration**
* **Horizontal scaling (multi-instance backend)**

Demonstrates:

* Containerization
* CI/CD pipeline
* Load balancing
* DevOps lifecycle
* 12-factor app principles

---

## 🗂 Repository Structure (Monorepo)

```
unimanga/
├── apps/
│   ├── mobile/        # React Native (Expo)
│   └── web/           # Web dashboard (Next.js)
├── backend/
│   ├── api/           # Node.js REST + WebSocket API
│   └── worker/        # Background jobs
├── packages/
│   ├── schemas/       # Shared Zod schemas
│   ├── ui/            # Shared UI components
│   └── config/        # Shared TS / ESLint configs
├── infra/
│   ├── docker/        # Dockerfiles
│   ├── nginx/         # Gateway config
│   └── ci/            # GitHub Actions
└── docs/              # Architecture & API documentation
```

---

## 🔁 Communication Flow

```
User Action
   ↓
Mobile App (local storage)
   ↓
Backend API (REST)
   ↓
Redis Cache
   ↓
WebSocket Broadcast
   ↓
Other Devices Synced
```

---

## 📊 Course Outcome Mapping

### ✅ React Native

* WebView integration
* Offline-first architecture
* Secure auth storage
* Real-time sync
* Mobile UI/UX design

### ✅ DevOps (~70%)

* Docker images & containers
* CI with GitHub Actions
* Load balancing
* Stateless backend
* Background workers

### ✅ High Level Design (~70%)

* API Gateway
* Caching & eviction
* Async vs sync communication
* Horizontal scaling
* Rate limiting
* Consistency trade-offs

---

## 🔒 Legal & Ethical Considerations

* No content hosting or redistribution
* No scraping or proxying
* All rendering happens on the original source website
* UniManga stores only **metadata and progress**

---

## 🚀 Future Enhancements (Out of Scope)

* Recommendation engine
* Full-text search
* Browser extension
* Multi-region deployment
* ML-based personalization

