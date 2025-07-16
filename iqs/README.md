# IQS Accreditation & Training API

## API Endpoint Reference (with Example Requests)

All endpoints require `Authorization: Bearer <token>` header unless noted.

---

## 🔐 Auth

### POST - /api/auth/login

**Example JSON:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### POST - /api/auth/reset

**Example JSON:**

```json
{
  "email": "user@example.com"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/auth/reset \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### POST - /api/auth/reset/confirm

**Example JSON:**

```json
{
  "email": "user@example.com",
  "token": "reset-token",
  "newPassword": "newpass123"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/auth/reset/confirm \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","token":"reset-token","newPassword":"newpass123"}'
```

---

## 🧑‍💼 Admin

### GET - /api/admin/dashboard

**No body required.**

```bash
curl -X GET http://localhost:5000/api/admin/dashboard -H "Authorization: Bearer <token>"
```

### GET - /api/admin/countries

**No body required.**

```bash
curl -X GET http://localhost:5000/api/admin/countries -H "Authorization: Bearer <token>"
```

### GET - /api/admin/schools

**No body required.**

```bash
curl -X GET http://localhost:5000/api/admin/schools -H "Authorization: Bearer <token>"
```

### GET - /api/admin/evaluators

**No body required.**

```bash
curl -X GET http://localhost:5000/api/admin/evaluators -H "Authorization: Bearer <token>"
```

### GET - /api/admin/users

**No body required.**

```bash
curl -X GET http://localhost:5000/api/admin/users -H "Authorization: Bearer <token>"
```
  {
  "email": "admin@example.com",
  "password": "admin123"
  }
### POST - /api/admin/message

**Example JSON (individual):**

```json
{
  "receiver_id": 2,
  "message": "Hello, user!"
}
```

**Example JSON (group):**

```json
{
  "group": "evaluator",
  "message": "Hello, evaluators!"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id":2,"message":"Hello, user!"}'
```

### POST - /api/admin/assign-evaluator

**Example JSON:**

```json
{
  "school_id": 1,
  "evaluator_id": 2
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/assign-evaluator \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"school_id":1,"evaluator_id":2}'
```

### POST - /api/admin/change-status

**Example JSON:**

```json
{
  "type": "school",
  "id": 1,
  "status": "approved"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/change-status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"school","id":1,"status":"approved"}'
```

### POST - /api/admin/assign-task

**Example JSON:**

```json
{
  "evaluator_id": 2,
  "school_id": 1,
  "description": "Visit and review school facilities"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/assign-task \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"evaluator_id":2,"school_id":1,"description":"Visit and review school facilities"}'
```

### GET - /api/admin/new-applications

**No body required.**

```bash
curl -X GET http://localhost:5000/api/admin/new-applications -H "Authorization: Bearer <token>"
```

### POST - /api/admin/create-user

**Example JSON:**

```json
{
  "name": "Evaluator Name",
  "email": "eval@example.com",
  "password": "pass1234",
  "role": "evaluator"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/create-user \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Evaluator Name","email":"eval@example.com","password":"pass1234","role":"evaluator"}'
```

### POST - /api/admin/add-school

**Example JSON:**

```json
{
  "name": "School Name",
  "address": "123 Main St",
  "contact_email": "school@example.com"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/add-school \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"School Name","address":"123 Main St","contact_email":"school@example.com"}'
```

### POST - /api/admin/add-evaluator

**Example JSON:**

```json
{
  "name": "Evaluator Name",
  "email": "eval@example.com",
  "password": "pass1234"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/add-evaluator \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Evaluator Name","email":"eval@example.com","password":"pass1234"}'
```

### POST - /api/admin/add-trainer

**Example JSON:**

```json
{
  "name": "Trainer Name",
  "email": "trainer@example.com",
  "password": "pass1234"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/add-trainer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Trainer Name","email":"trainer@example.com","password":"pass1234"}'
```

---

## ✅ Evaluator

### GET - /api/evaluator/my-schools

**No body required.**

```bash
curl -X GET http://localhost:5000/api/evaluator/my-schools -H "Authorization: Bearer <token>"
```

### GET - /api/evaluator/my-tasks

**No body required.**

```bash
curl -X GET http://localhost:5000/api/evaluator/my-tasks -H "Authorization: Bearer <token>"
```

### POST - /api/evaluator/upload

**Example form-data:**

- file: (file)
- school_id: 1
- doc_type: registration

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/evaluator/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.pdf" \
  -F "school_id=1" \
  -F "doc_type=registration"
```

### GET - /api/evaluator/download

**No body required.**

```bash
curl -X GET http://localhost:5000/api/evaluator/download -H "Authorization: Bearer <token>"
```

### GET - /api/evaluator/download/:doc_id

**No body required.**

```bash
curl -X GET http://localhost:5000/api/evaluator/download/9 -H "Authorization: Bearer <token>" -OJ
```

### POST - /api/evaluator/upload-report

**Example form-data:**

- file: (file)
- school_id: 1
- visit_date: 2025-07-01

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/evaluator/upload-report \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/report.pdf" \
  -F "school_id=1" \
  -F "visit_date=2025-07-01"
```

### GET - /api/evaluator/visit-history

**No body required.**

```bash
curl -X GET http://localhost:5000/api/evaluator/visit-history -H "Authorization: Bearer <token>"
```

### GET - /api/evaluator/reports/:school_id

**No body required.**

```bash
curl -X GET http://localhost:5000/api/evaluator/reports/1 -H "Authorization: Bearer <token>"
```

### DELETE - /api/evaluator/reports/:id

**No body required.**

```bash
curl -X DELETE http://localhost:5000/api/evaluator/reports/1 -H "Authorization: Bearer <token>"
```

### POST - /api/message/send

**Example JSON:**

```json
{
  "receiver_id": 1,
  "message": "Hello, admin!"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/message/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id":1,"message":"Hello, admin!"}'
```

### GET - /api/message/inbox

**No body required.**

```bash
curl -X GET http://localhost:5000/api/message/inbox -H "Authorization: Bearer <token>"
```

### GET - /api/message/sent

**No body required.**

```bash
curl -X GET http://localhost:5000/api/message/sent -H "Authorization: Bearer <token>"
```

---

## 🏫 School

### POST - /api/school/first-time-apply

**Example form-data:**

- name: School Name
- country: Rwanda
- accreditation_type: new
- registration_doc: (file)
- curriculum_doc: (file)

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/school/first-time-apply \
  -H "Authorization: Bearer <token>" \
  -F "name=School Name" \
  -F "country=Rwanda" \
  -F "accreditation_type=new" \
  -F "registration_doc=@/path/to/registration.pdf" \
  -F "curriculum_doc=@/path/to/curriculum.pdf"
```

### POST - /api/school/apply

**Example JSON:**

```json
{
  "type": "renewal"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/school/apply \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"renewal"}'
```

### GET - /api/school/track

**No body required.**

```bash
curl -X GET http://localhost:5000/api/school/track -H "Authorization: Bearer <token>"
```

### POST - /api/school/upload-docs

**Example JSON:**

```json
{
  "school_id": 1,
  "doc_path": "uploads/document.pdf"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/school/upload-docs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"school_id":1,"doc_path":"uploads/document.pdf"}'
```

### GET - /api/school/download-certificate

**No body required.**

```bash
curl -X GET http://localhost:5000/api/school/download-certificate -H "Authorization: Bearer <token>" -OJ
```

### GET - /api/school/feedback/:app_id

**No body required.**

```bash
curl -X GET http://localhost:5000/api/school/feedback/1 -H "Authorization: Bearer <token>"
```

### GET - /api/school/dashboard

**No body required.**

```bash
curl -X GET http://localhost:5000/api/school/dashboard -H "Authorization: Bearer <token>"
```

---

## 🧑‍🏫 Trainer

### POST - /api/trainer/manage-session

**Example form-data:**

- file: (file)
- title: July Training
- session_date: 2025-07-10

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/trainer/manage-session \
  -H "Authorization: Bearer <token>" \
  -F "title=July Training" \
  -F "session_date=2025-07-10" \
  -F "file=@/path/to/report.pdf"
```

### GET - /api/trainer/sessions

**No body required.**

```bash
curl -X GET http://localhost:5000/api/trainer/sessions -H "Authorization: Bearer <token>"
```

### GET - /api/trainer/sessions/:id

**No body required.**

```bash
curl -X GET http://localhost:5000/api/trainer/sessions/1 -H "Authorization: Bearer <token>"
```

### PUT - /api/trainer/sessions/:id

**Example JSON:**

```json
{
  "title": "Updated Training",
  "session_date": "2025-07-11",
  "report_path": "uploads/updated_report.pdf"
}
```

**Example curl:**

```bash
curl -X PUT http://localhost:5000/api/trainer/sessions/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Training","session_date":"2025-07-11","report_path":"uploads/updated_report.pdf"}'
```

### DELETE - /api/trainer/sessions/:id

**No body required.**

```bash
curl -X DELETE http://localhost:5000/api/trainer/sessions/1 -H "Authorization: Bearer <token>"
```

### POST - /api/trainer/track-attendance

**Example form-data:**

- file: (file)
- session_id: 1

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/trainer/track-attendance \
  -H "Authorization: Bearer <token>" \
  -F "session_id=1" \
  -F "file=@/path/to/attendance.pdf"
```

### POST - /api/trainer/upload-report

**Example JSON:**

```json
{
  "session_id": 1,
  "report_path": "uploads/report.pdf"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/trainer/upload-report \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id":1,"report_path":"uploads/report.pdf"}'
```

---

## 📂 Files

### POST - /api/files/upload

**Example form-data:**

- file: (file)
- type: registration
- related_id: 1

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.pdf" \
  -F "type=registration" \
  -F "related_id=1"
```

### GET - /api/files/download/:id

**No body required.**

```bash
curl -X GET http://localhost:5000/api/files/download/1 -H "Authorization: Bearer <token>" -OJ
```

---

## 💬 Messaging & Chat

### POST - /api/admin/message

**Example JSON:**

```json
{
  "receiver_id": 2,
  "message": "Hello, user!"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/admin/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id":2,"message":"Hello, user!"}'
```

### POST - /api/message/send

**Example JSON:**

```json
{
  "receiver_id": 1,
  "message": "Hello, admin!"
}
```

**Example curl:**

```bash
curl -X POST http://localhost:5000/api/message/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id":1,"message":"Hello, admin!"}'
```

### GET - /api/message/inbox

**No body required.**

```bash
curl -X GET http://localhost:5000/api/message/inbox -H "Authorization: Bearer <token>"
```

### GET - /api/message/sent

**No body required.**

```bash
curl -X GET http://localhost:5000/api/message/sent -H "Authorization: Bearer <token>"
```

---

## 🟢 Real-Time Chat (Socket.IO)

- Connect to `http://localhost:5000` using Socket.IO client.
- Register your user ID after connecting:
  ```js
  socket.emit("register", userId);
  ```
- Listen for messages:
  ```js
  socket.on("receive-message", (data) => {
    console.log("Received:", data);
  });
  ```
- Send messages via REST API for persistence and real-time delivery.

---

## Example User Roles & Logins

```
Admin:    admin@example.com / admin123
Evaluator: honozzo416@gmail.com / evaluator123
Trainer:   niyohonor1604@gmail.com / trainer123
School:    honore2609@gmail.com / school123
```

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure your database:**
   - Edit `config/db.js` with your PostgreSQL credentials.
3. **Start the server:**
   ```bash
   npm start
   ```
   The API will run on `http://localhost:5000` by default.

---

## Authentication

- All endpoints (except `/api/auth/login` and password reset) require a JWT token in the `Authorization: Bearer <token>` header.
- Use `/api/auth/login` to obtain a token.

---

## Testing

- Use Postman, curl, or the provided HTML chat client to test endpoints.
- For real-time chat, use the HTML client or a Socket.IO client.

---
