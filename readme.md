# TaskFlux - Request Management Application

**Backend Application** | [Live Demo](https://taskflux-fe-production.up.railway.app)

TaskFlux is a full-stack request management web application designed to streamline the workflow between employees and managers. It enables employees to create and manage requests while allowing managers to approve or reject them based on business rules.

##### FE Repo: [link](https://github.com/shashikant888/TaskFlux-FE)
---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Business Logic & Workflows](#business-logic--workflows)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Logging & Monitoring](#logging--monitoring)
- [Deployment](#deployment)

---

<a id="overview"></a>
## 🎯 Overview

TaskFlux implements a request management system with role-based workflows. It enforces real business rules through a structured approval process:

1. **Employee (A)** creates and assigns a request to another **Employee (B)**
2. **Employee (B)'s Manager** reviews and approves/rejects the request
3. **Employee (B)** can only take action and close the request after approval
4. Full audit trail of all actions with timestamps and responsible users

---

<a id="features"></a>
## ✨ Features

### Core Functionality
- ✅ User authentication with JWT tokens
- ✅ Role-based access control (Employee & Manager)
- ✅ Request creation and assignment
- ✅ Manager approval/rejection workflow
- ✅ Employee task action and closure
- ✅ Request listing with filters and pagination
- ✅ Real-time request status tracking

### Technical Features
- ✅ RESTful API architecture
- ✅ PostgreSQL database with Sequelize ORM
- ✅ Redis caching for performance optimization
- ✅ JWT-based authentication
- ✅ Input validation using Joi
- ✅ Comprehensive error handling
- ✅ Request/Response logging with Winston
- ✅ Security headers with Helmet
- ✅ CORS enabled for cross-origin requests

---

<a id="tech-stack"></a>
## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL
- **ORM:** Sequelize 6.x
- **Cache:** Redis
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Logging:** Winston + Morgan
- **Security:** Helmet, bcryptjs
- **Environment:** dotenv

---

<a id="prerequisites"></a>
## 📦 Prerequisites

Before running the application, ensure you have:

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or remote)
- **Redis** server (optional, for caching)

---

<a id="installation--setup"></a>
## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shashikant888/TaskFlux.git
cd TaskFlux
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory. Refer to [Environment Variables](#environment-variables) section below.

### 4. Initialize Database

The application automatically initializes the database on startup using Sequelize migrations. The following tables are created:

- **users** - User accounts with roles and manager relationships
- **tasks** - Request/task records with status tracking

### 5. Start the Server

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on the configured port (default: 3000).

---

<a id="environment-variables"></a>
## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Node Environment
NODE_ENV=development
PORT=3000

# Database Configuration (Development)
POSTGRES_HOST_DEV=localhost
POSTGRES_PORT_DEV=5432
POSTGRES_DB_DEV=taskflux_dev
POSTGRES_USER_DEV=postgres
POSTGRES_PASSWORD_DEV=your_password
POSTGRES_SSL_DEV=false
POSTGRES_LOGGING_DEV=false
POSTGRES_POOL_MAX_DEV=10
POSTGRES_POOL_MIN_DEV=1

# Database Configuration (Production)
POSTGRES_HOST_PROD=your_prod_host
POSTGRES_PORT_PROD=5432
POSTGRES_DB_PROD=taskflux_prod
POSTGRES_USER_PROD=your_prod_user
POSTGRES_PASSWORD_PROD=your_prod_password
POSTGRES_SSL_PROD=true
POSTGRES_LOGGING_PROD=false
POSTGRES_POOL_MAX_PROD=20
POSTGRES_POOL_MIN_PROD=5

# Security
SESSION_SECRET=your_secret_key_here
SESSION_EXPIRE_IN=7d
SALT_ROUNDS=12

# Redis Cache
IS_REDIS_STORE=true
REDIS_URI_DEV=redis://localhost:6379
REDIS_URI_PROD=your_redis_prod_uri
REDIS_PROJECT=taskflux

# Logging
LOG_LEVEL=debug
LOGGER_ENABLED=true
LOG_ENABLED=true

# URLs
URL=http://localhost:3000
PROD_URL=https://taskflux-production.up.railway.app

# Timezone
TIME_ZONE=5.5
```

---

<a id="running-the-application"></a>
## ▶️ Running the Application

### Health Check Endpoint

Once running, verify the server is active:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-28T10:30:00.000Z"
}
```

---

<a id="api-documentation"></a>
## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "employee",
  "managerId": "uuid-of-manager" // Optional for employees
}
```

**Response:** User object with JWT token

#### Sign In
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** User object with JWT token

### User Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {token}
```

#### Update User Profile
```http
PATCH /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

### Task/Request Endpoints

#### Create Task
```http
POST /api/task
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Request Title",
  "description": "Detailed description",
  "assignedToId": "uuid-of-employee"
}
```

**Required Role:** Employee  
**Response:** Created task object with `pending_approval` status

#### List Tasks
```http
GET /api/task?page=1&limit=20&status=pending_approval&createdBy=uuid&assignedTo=uuid
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (pending_approval, approved, rejected, in_progress, closed)
- `createdBy` - Filter by creator UUID
- `assignedTo` - Filter by assignee UUID
- `disableCache` - Bypass Redis cache if true

**Response:** Paginated task list with metadata

#### Get Task Details
```http
GET /api/task/{taskId}
Authorization: Bearer {token}
```

#### Approve Task (Manager Only)
```http
PATCH /api/task/{taskId}/approve
Authorization: Bearer {token}
```

**Required Role:** Manager (of the assigned employee)  
**Status Change:** `pending_approval` → `approved`

#### Reject Task (Manager Only)
```http
PATCH /api/task/{taskId}/reject
Authorization: Bearer {token}
```

**Required Role:** Manager (of the assigned employee)  
**Status Change:** `pending_approval` → `rejected`

#### Start Task (Employee Only)
```http
PATCH /api/task/{taskId}/start
Authorization: Bearer {token}
```

**Required Role:** Employee (assignee)  
**Requirement:** Task must be in `approved` status  
**Status Change:** `approved` → `in_progress`

#### Close Task (Employee Only)
```http
PATCH /api/task/{taskId}/close
Authorization: Bearer {token}
```

**Required Role:** Employee (assignee)  
**Requirement:** Task must be in `in_progress` status  
**Status Change:** `in_progress` → `closed`

---

<a id="project-structure"></a>
## 📁 Project Structure

```
TaskFlux/
├── index.js                          # Application entry point
├── package.json                      # Dependencies & scripts
├── .env                              # Environment variables
│
├── app/
│   ├── server.js                     # Express server setup
│   │
│   ├── config/
│   │   ├── constants.js              # App constants & configuration
│   │   ├── db.js                     # Database initialization
│   │   ├── sequelize.js              # Sequelize instance
│   │   └── redis.js                  # Redis connection
│   │
│   ├── lib/
│   │   ├── logger.js                 # Winston logger setup
│   │   ├── jwt.utils.js              # JWT token utilities
│   │   ├── redis.utils.js            # Redis cache utilities
│   │   ├── date.utils.js             # Date/timezone utilities
│   │   ├── helper.utils.js           # Helper functions
│   │   ├── catchAsync.js             # Async error handler wrapper
│   │   └── ResUtils.js               # Response utility functions
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT authentication
│   │   ├── role.middleware.js        # Role-based authorization
│   │   ├── error.js                  # Error handling middleware
│   │   ├── resConv.js                # Response conversion
│   │   ├── SchemaValidator.js        # Joi schema validation
│   │   └── ApiError.js               # Custom API error class
│   │
│   ├── routes/
│   │   └── api.js                    # Main API routes aggregator
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   ├── auth.controller.js    # Auth logic
│   │   │   ├── auth.service.js       # Auth business logic
│   │   │   ├── auth.routes.js        # Auth endpoints
│   │   │   └── auth.validation.js    # Joi validation schemas
│   │   │
│   │   ├── user/
│   │   │   ├── user.controller.js    # User logic
│   │   │   ├── user.model.js         # User Sequelize model
│   │   │   ├── user.service.js       # User business logic
│   │   │   ├── user.routes.js        # User endpoints
│   │   │   └── user.validation.js    # User validation schemas
│   │   │
│   │   └── task/
│   │       ├── task.controller.js    # Task/request logic
│   │       ├── task.model.js         # Task Sequelize model
│   │       ├── task.service.js       # Task business logic
│   │       ├── task.routes.js        # Task endpoints
│   │       └── task.validation.js    # Task validation schemas
│   │
│   └── models/
│       └── index.js                  # Model associations
│
├── logs/                             # Application logs directory
│
├── TaskFlux.postman_collection.json  # Postman API collection
├── TaskFlux.postman_environment.json # Postman environment config
└── readme.md                         # This file
```

---

<a id="business-logic--workflows"></a>
## 🔄 Business Logic & Workflows

### Task Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                       TASK LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────┘

1. CREATION (Employee A)
   └─→ Creates task, assigns to Employee B
       Status: pending_approval
       Waiting for: Employee B's Manager approval

2. MANAGER DECISION (Employee B's Manager)
   ├─→ APPROVE
   │   Status: approved
   │   Employee B can now start working
   │
   └─→ REJECT
       Status: rejected
       Task ends, Employee B cannot proceed

3. EXECUTION (Employee B - only if approved)
   ├─→ START
   │   Status: in_progress
   │   Task actively being worked on
   │
   └─→ CLOSE (when in_progress)
       Status: closed
       Task completed

KEY RULES:
✓ Employee B can ONLY start if manager approved
✓ Employee B can ONLY close if task is in_progress
✓ Only Employee B's manager can approve/reject
✓ Task creator cannot take actions on their own task
✓ All actions are timestamped and logged
```

### Validation Rules

**Task Creation:**
- Title and description are required
- Assigned employee must exist and have a manager assigned
- Only employees can create tasks

**Manager Approval:**
- Only the assigned employee's manager can approve
- Task must be in `pending_approval` status
- Approval recorded with timestamp and approver ID

**Task Start:**
- Only assigned employee can start
- Task must be in `approved` status
- Records start timestamp

**Task Close:**
- Only assigned employee can close
- Task must be in `in_progress` status
- Records closure timestamp

---

<a id="authentication--authorization"></a>
## 🔐 Authentication & Authorization

### JWT Token Flow

```
1. User logs in with email & password
2. System validates credentials against hashed password
3. JWT token generated (expires in 7 days)
4. Token sent in response
5. Client includes token in Authorization header: Bearer {token}
6. Each request validated against token
```

### Role-Based Access Control (RBAC)

Two roles with distinct permissions:

| Action | Employee | Manager |
|--------|----------|---------|
| Create Task | ✅ | ❌ |
| List Tasks | ✅ (own) | ✅ (team) |
| Approve Task | ❌ | ✅ |
| Reject Task | ❌ | ✅ |
| Start Task | ✅ | ❌ |
| Close Task | ✅ | ❌ |

### Password Security

- Passwords hashed using bcryptjs (12 salt rounds)
- Never stored or transmitted in plain text
- Verified on login using bcrypt.compare()
- Automatically excluded from API responses

---

<a id="database-schema"></a>
## 💾 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('employee', 'manager') NOT NULL,
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEXES:
  - email (unique)
  - role
  - manager_id
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending_approval', 'approved', 'rejected', 'in_progress', 'closed') 
         DEFAULT 'pending_approval',
  created_by_id UUID NOT NULL REFERENCES users(id),
  assigned_to_id UUID NOT NULL REFERENCES users(id),
  approved_by_id UUID REFERENCES users(id),
  rejected_by_id UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  started_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEXES:
  - created_by_id
  - assigned_to_id
  - status
);
```

---

<a id="error-handling"></a>
## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Error Codes

| Status | Scenario |
|--------|----------|
| 400 | Invalid input, validation failed |
| 401 | Unauthorized, invalid/missing token |
| 403 | Forbidden, insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, invalid state transition) |
| 500 | Server error |

### Validation Errors

Include detailed field-level errors:
```json
{
  "success": false,
  "message": "Validation failed",
  "details": {
    "email": "must be a valid email",
    "password": "must be at least 8 characters"
  }
}
```

---

<a id="logging--monitoring"></a>
## 📊 Logging & Monitoring

### Winston Logger Configuration

**Log Levels:**
- `error` - Critical errors
- `warn` - Warnings
- `info` - General information
- `debug` - Detailed debugging information

**Log Locations:**
- Console output (development)
- Daily rotated files in `/logs` directory
- Separate files for errors

**Logged Information:**
- API request/response details
- Authentication attempts
- Business logic operations
- Error stack traces
- Timestamps with timezone

### Request Logging

Morgan middleware logs:
- HTTP method and endpoint
- Status code
- Response time
- User agent

---

<a id="deployment"></a>
## 🚀 Deployment

The application is currently deployed on **Railway** at:

```
https://taskflux-production.up.railway.app/
```

### Deployment Configuration

**Environment:** Production  
**Database:** PostgreSQL (Railway)  
**Cache:** Redis (Railway)  
**Node Version:** 18+  

### Deployment Steps

1. **Push to GitHub** - Ensure code is on main branch
2. **Connect Railway** - Link GitHub repository to Railway
3. **Configure Environment** - Set production environment variables in Railway dashboard
4. **Auto Deploy** - Railway automatically deploys on push to main
5. **Monitor** - Check Railway logs and metrics dashboard

### Health Checks

Railway monitors application health via:
```
GET /health
```

Expected response: `{ "status": "ok", "timestamp": "..." }`

---

## 📝 Testing the Application

### Using Postman

1. Import `TaskFlux.postman_collection.json` into Postman
2. Import `TaskFlux.postman_environment.json` for environment variables
3. Update environment variables (URL, tokens, etc.)
4. Test API endpoints in order:
   - Sign Up
   - Sign In
   - Create Task
   - Approve/Reject Task
   - Start/Close Task

### Manual Testing Example

```bash
# 1. Sign Up as Employee
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "employee",
    "managerId": "manager-uuid"
  }'

# 2. Sign In
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# 3. Create Task (use token from login response)
curl -X POST http://localhost:3000/api/task \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Report",
    "description": "Finish quarterly report",
    "assignedToId": "employee-uuid"
  }'
```

---

## 📞 Support

For issues or questions:
- Create an issue on [GitHub](https://github.com/shashikant888/TaskFlux/issues)
- Review the logs in `/logs` directory
- Check environment variables configuration

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Version:** 1.0.0  
**Last Updated:** November 29, 2025  
**Author:** Shashikant Vishwakarma [shashikant.888.v@gmail.com](shashikant.888.v@gmail.com)