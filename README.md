# EVehicle Supply Chain Management System ⚡⛓️🛒

A modern, Web3-enabled supply chain tracking system for EV parts, built with Node.js, React, and Solidity.

## 🚀 Key Features
- **Blockchain Auditing**: Sale transactions are recorded on a local Hardhat node for an immutable audit trail.
- **Modern Backend**: Node.js + Express with MongoDB Atlas for scalable data management.
- **Premium UI**: React + Vite with a dark-themed glassmorphism design.
- **Role-Based Access**: Admin, Manager, and Customer levels with JWT authentication.

---

## 🛠️ Installation & Setup

Because `node_modules` are intentionally excluded to keep the repository lightweight, you must install them locally first.

### Step 1: Install Dependencies
Open your terminal and run the following in each folder:

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**Blockchain:**
```bash
cd blockchain
npm install
```

---

## 🏗️ How to Run

### 1. Blockchain (Hardhat)
```bash
cd blockchain
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Backend (API)
1. Configure your `.env` in the `backend/` folder (use `.env.example` as a template).
2. Run the seed script once: `node seed.js`
3. Start the server: `npm run dev`

### 3. Frontend (UI)
```bash
cd frontend
npm run dev
```
Access the app at `http://localhost:5173`.

---

## 🔑 Default Test Credentials
- **Admin**: `Admin` / `admin123`
- **Manager**: `Manager` / `manager123`
- **User**: `User` / `user123`
