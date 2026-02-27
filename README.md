# 🏥 MediFlow — Inter-Department Workflow Automation System

> **Hackathon Round 1 — Backend Workflow Automation Challenge**

A backend engine that intelligently routes patient-related requests across hospital departments using predefined workflows — ensuring visibility, accountability, and zero manual follow-ups.

---

## 🚨 The Problem

In hospitals, critical processes like **patient discharge**, **lab testing**, and **insurance approval** require tight coordination across multiple departments. Today, this coordination relies on:

- 📞 Phone calls and verbal handoffs
- 📄 Paper slips and manual forms
- 🔁 Human-driven follow-ups

**The result?**

| Issue | Impact |
|---|---|
| Lost or delayed requests | Longer patient stays |
| No visibility into progress | Staff frustration |
| No accountability per stage | Errors go unnoticed |
| Manual coordination overhead | Operational inefficiency |

---

## 💡 The Solution

**MediFlow** introduces a **Workflow Automation Engine** that digitizes and enforces inter-department workflows. Think of it like order tracking — but for hospital operations.

✅ Automatically routes requests between departments  
✅ Tracks real-time stage progression  
✅ Prevents out-of-order or unauthorized approvals  
✅ Maintains a full, timestamped audit trail  

---

## ⚙️ Key Features

| Feature | Description |
|---|---|
| 🔄 Predefined Workflows | Configurable department routing templates |
| 🧭 Sequential Enforcement | No stage can be skipped or bypassed |
| 📊 Request Tracking | Real-time status visibility per request |
| 🏷️ Department Ownership | Each stage is locked to a specific department |
| 📜 Audit Logging | Full history of who acted, when, and what happened |

---

## 🧩 Workflows Implemented

### 1️⃣ Patient Discharge Workflow

```
Doctor → Pharmacy → Billing → Insurance → Admin
```

A patient is discharged **only after**:
1. **Doctor** issues medical clearance
2. **Pharmacy** completes medicine reconciliation
3. **Billing** settles the patient account
4. **Insurance** validates coverage and claim
5. **Admin** finalizes and closes the discharge

---

### 2️⃣ Lab Test Workflow

```
Doctor → Lab → Billing → Lab → Doctor
```

Automates the full diagnostic lifecycle:
1. **Doctor** recommends a lab test
2. **Lab** collects the sample
3. **Billing** validates payment
4. **Lab** processes sample and generates the report
5. **Doctor** reviews and acts on results

---

## 🏗️ System Architecture

```
Client Request
     │
     ▼
Express.js API Layer
     │
     ▼
Workflow Engine (Core Logic)
  ├── WorkflowTemplate  →  Defines routing
  ├── Request           →  Patient request entity
  └── RequestStage      →  Per-department action tracker
     │
     ▼
MongoDB (Atlas) via Mongoose
```

**Tech Stack:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose

---

## 🗃️ Core Data Models

### `WorkflowTemplate`
Defines the ordered list of departments for a given workflow type.

```json
{
  "type": "discharge",
  "stages": ["Doctor", "Pharmacy", "Billing", "Insurance", "Admin"]
}
```

### `Request`
Represents a patient's active workflow request.

```json
{
  "patientName": "Ravi",
  "workflowType": "discharge",
  "currentStageIndex": 1,
  "status": "in-progress"
}
```

### `RequestStage`
Tracks the action taken at each department stage.

```json
{
  "requestId": "...",
  "department": "Doctor",
  "approved": true,
  "actedBy": "Dr. Sharma",
  "actedAt": "2024-01-15T10:30:00Z"
}
```

---

## 🔁 Workflow Execution Logic

When a request is created:

1. **All stages are pre-generated** based on the workflow template
2. **Every stage starts as `approved: false`**
3. **Only the current department** can approve its stage
4. **Next stage auto-unlocks** upon successful approval
5. **Request status** updates to `completed` when all stages are done

```
[Stage 1: Doctor]     → approved ✅
[Stage 2: Pharmacy]   → approved ✅
[Stage 3: Billing]    → IN PROGRESS 🔄
[Stage 4: Insurance]  → locked 🔒
[Stage 5: Admin]      → locked 🔒
```

---

## 🚀 API Reference

### Create a Workflow Template
```http
POST /workflow/create
```
```json
{
  "type": "discharge",
  "stages": ["Doctor", "Pharmacy", "Billing", "Insurance", "Admin"]
}
```

---

### Create a Patient Request
```http
POST /request/create
```
```json
{
  "patientName": "Ravi",
  "workflowType": "discharge"
}
```

**Response:**
```json
{
  "requestId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "status": "in-progress",
  "currentStage": "Doctor"
}
```

---

### Approve a Stage
```http
POST /request/approve
```
```json
{
  "requestId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "department": "Doctor",
  "actedBy": "Dr. Sharma"
}
```

**Error (out-of-order attempt):**
```json
{
  "error": "Unauthorized: Billing cannot act before Pharmacy approves."
}
```

---

### Track a Request
```http
GET /request/:id
```
**Response:**
```json
{
  "patientName": "Ravi",
  "workflowType": "discharge",
  "currentStage": "Billing",
  "status": "in-progress",
  "stages": [
    { "department": "Doctor",   "approved": true,  "actedBy": "Dr. Sharma" },
    { "department": "Pharmacy", "approved": true,  "actedBy": "Pharmacist Meena" },
    { "department": "Billing",  "approved": false, "actedBy": null },
    { "department": "Insurance","approved": false, "actedBy": null },
    { "department": "Admin",    "approved": false, "actedBy": null }
  ]
}
```

---

## 🔒 Workflow Control & Validation

Out-of-order approvals are **rejected at the engine level**.

```
Billing tries to approve → ❌ REJECTED
Reason: Pharmacy has not yet approved.
```

This ensures:
- ✅ Process discipline is enforced programmatically
- ✅ No department can act prematurely
- ✅ Clear accountability at every stage

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd mediflow

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Add your MongoDB URI to .env

# 4. Seed workflow templates
npm run seed

# 5. Start the server
npm run dev
```

### Environment Variables

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
```

---

## 📁 Project Structure

```
mediflow/
├── models/
│   ├── WorkflowTemplate.js
│   ├── Request.js
│   └── RequestStage.js
├── routes/
│   ├── workflow.js
│   └── request.js
├── controllers/
│   ├── workflowController.js
│   └── requestController.js
├── engine/
│   └── workflowEngine.js      # Core routing & approval logic
├── middleware/
│   └── errorHandler.js
├── app.js
└── server.js
```

---

## 🌍 Future Scope

| Feature | Description |
|---|---|
| 🔐 Role-Based Auth | JWT-secured department logins |
| ⏱️ SLA Tracking | Breach alerts if stages take too long |
| 🔀 Parallel Workflows | Multiple departments acting simultaneously |
| 📱 UI Dashboard | Real-time visual request tracker |
| 🔔 Notification System | SMS/email alerts on stage transitions |
| 📈 Analytics | Bottleneck detection across workflows |

---

## 🎯 Impact

| Before MediFlow | After MediFlow |
|---|---|
| Manual phone coordination | Automated stage routing |
| Lost paper requests | Full digital audit trail |
| No visibility | Real-time tracking per request |
| Approvals out of order | Enforced sequential flow |
| Blame ambiguity | Clear department accountability |

---

## 👨‍💻 Built For

**Hackathon Round 1 — Backend Workflow Automation Challenge**

---

*Built with ❤️ to make hospital operations faster, smarter, and more humane.*
