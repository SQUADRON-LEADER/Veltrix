# Veltrix

**Veltrix** is an enterprise-grade, DevOps-centric **Version Control System** and real-time collaboration platform. Inspired by industry-standard tools (like GitHub/GitLab), it is designed to manage repositories, track code changes, and facilitate seamless developer collaboration.

The core technology stack features **React (Vite)** on the frontend and a high-performance **Node.js, Express, MongoDB, and Socket.io** backend. 

A central pillar of this DevOps project is its robust cloud infrastructure. We are building this with a heavy emphasis on modern deployment practices, utilizing exactly **10 key Amazon Web Services (AWS)** to achieve massive scalability, security, and automated CI/CD pipelines.

---

## 🌟 Core Features (Version Control & Collaboration)
- **Repository Management:** Create, manage, and track code repositories, complete with branching and commit history metadata.
- **Real-Time Collaboration:** Powered by Socket.io, enabling instant notifications for pull requests, live code reviews, and issue tracking.
- **Secure Code Storage:** Secure, direct-to-cloud file and code blob uploads leveraging AWS signed URLs.
- **DevOps Integrations:** Built with continuous integration in mind to support automated testing and code quality checks.
- **Role-Based Access Control (RBAC):** Strict permissions for repository owners, contributors, and read-only viewers.

---

## 🏗️ 10 Key AWS Services Powering Veltrix

Veltrix is engineered for the cloud. Below are the **10 AWS services** carefully selected to build this scalable version control platform:

### 1. Amazon EC2 (Elastic Compute Cloud)
Hosts the robust Express.js API, Git operations engine, and Socket.io servers. Managed via Auto Scaling Groups to handle high CPU loads during heavy repository cloning or traffic spikes.

### 2. Amazon S3 (Simple Storage Service)
The primary object storage for code blobs, repository archives, and user media. The backend leverages the `aws-sdk` to generate Pre-signed URLs for direct, secure file transfers.

### 3. Amazon DocumentDB (MongoDB Compatibility)
Used as the primary, highly-available metadata store for users, repositories, commit hashes, pull requests, and application state.

### 4. Amazon CloudFront
Acts as the global Content Delivery Network (CDN) for the React frontend and static assets, guaranteeing sub-100ms load times for developers worldwide.

### 5. Application Load Balancer (ALB)
Distributes incoming HTTP and WebSocket traffic evenly across multiple backend EC2 instances. Critically configured with Sticky Sessions for persistent Socket.io connections.

### 6. AWS IAM (Identity and Access Management)
Enforces the principle of least privilege. EC2 instances assume specific IAM Roles (e.g., `S3ReadWriteRole`) to access other AWS services securely without hardcoded credentials.

### 7. AWS CodePipeline & CodeBuild
The heart of our own DevOps setup. Automates the CI/CD pipeline, automatically linting, testing, and deploying the Veltrix platform to our servers whenever new code is merged.

### 8. Amazon ElastiCache (Redis)
Speeds up frequent database queries (like fetching repository metadata) and serves as the Socket.io Redis Adapter to broadcast real-time events across multiple EC2 nodes.

### 9. Amazon CloudWatch
The central observability platform. Aggregates logs from the backend and monitors server health, triggering alerts if latency spikes during heavy version control operations.

### 10. Amazon Route 53 (with ACM)
Route 53 manages our highly available DNS routing, paired with AWS Certificate Manager (ACM) to provision SSL/TLS certificates, ensuring all code transfers and API calls happen over secure HTTPS connections.

---

## 💻 Technical Stack Overview

### Frontend Ecosystem
- **Framework:** React 18 (Vite)
- **Styling:** CSS3 / CSS Modules (Dynamic and responsive design)
- **State Management:** React Context API / Custom Hooks
- **Real-Time:** `socket.io-client`
- **HTTP Client:** Fetch API / Axios

### Backend Ecosystem
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5.x
- **Database:** MongoDB / Mongoose ODM
- **Real-Time:** Socket.io (with Redis Adapter for horizontal scaling)
- **Cloud Integration:** AWS SDK (`aws-sdk` v2 / v3)
- **Security:** `jsonwebtoken` (JWT), `bcryptjs` (Password Hashing), `cors`

---

## 🚀 Local Development Setup

To run the Veltrix architecture on your local machine for development:

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Running locally or a MongoDB Atlas cluster)
- Redis (Optional for local development)
- AWS Account (Create an IAM user with programmatic access for local S3 testing)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/veltrix.git
cd veltrix
```

### 2. Configure the Backend
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the root of the `backend` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/veltrix

# Security
JWT_SECRET=super_secret_jwt_key_here

# AWS Configuration (For Local Development via aws-sdk)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_local_iam_access_key
AWS_SECRET_ACCESS_KEY=your_local_iam_secret_key
AWS_S3_BUCKET_NAME=veltrix-dev-bucket
```

Start the backend server in development mode:
```bash
npm run dev
# Server should now be running on http://localhost:5000
```

### 3. Configure the Frontend
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend/vite-project
npm install
```

Create a `.env` file in the root of the `frontend/vite-project` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
# Frontend should now be running on http://localhost:5173
```

---

## 🛡️ Security Best Practices Enforced
1. **Never commit `.env` files**: All sensitive credentials are excluded via `.gitignore`.
2. **Stateless Authentication**: JWTs are used to verify user identity, avoiding server-side session memory bloat.
3. **Password Security**: Passwords are never stored in plain text. They are salted and hashed using `bcryptjs`.
4. **AWS IAM Roles**: In production, the backend retrieves temporary credentials via IAM instance profiles instead of relying on long-lived access keys.

---
*Veltrix is engineered for performance, designed for scale, and built for modern DevOps teams.*
