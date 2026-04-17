# Spatial Data Platform

เว็บแอปพลิเคชันสำหรับการจัดการและแสดงข้อมูลตำแหน่งเชิงพื้นที่ (Spatial Location Data) 
แแพลตฟอร์มข้อมูลเชิงพื้นที่ (Spatial Data Platform) เป็นเว็บแอปพลิเคชันแบบ Full-stack ที่ออกแบบมาเพื่อจัดการข้อมูลพิกัดทางภูมิศาสตร์และตำแหน่งเชิงพื้นที่ สำหรับการเรียกดู, สร้าง, แก้ไข และลบข้อมูลจุดตำแหน่ง พร้อมการแสดงผลด้วยแผนที่

แพลตฟอร์มนี้ประกอบด้วย:
- **Backend**: REST API ที่พัฒนาด้วยภาษา Go โดยใช้ Echo framework และ MongoDB สำหรับการเก็บข้อมูล
- **Frontend**: Single-page application ที่พัฒนาด้วย React โดยใช้ Vite, TypeScript และ MapLibre GL สำหรับการทำแผนที่แบบโต้ตอบ

แอปพลิเคชันรองรับรูปแบบข้อมูล GeoJSON สำหรับข้อมูลเชิงพื้นที่ และมีโหมดการรับชมที่หลากหลาย ทั้งโหมดแผนที่, โหมดตาราง และโหมดแบ่งหน้าจอเพื่อการวิเคราะห์ข้อมูลที่ครอบคลุม

## สารบัญ

- [สิ่งที่ทำไปแล้ว](#สิ่งที่ทำไปแล้ว)
- [Feature](#feature)
  - [Frontend](#frontend)
  - [ฟีเจอร์ของ Backend](#ฟีเจอร์ของ-backend)
- [การติดตั้ง](#การติดตั้ง)
- [การ Install Dependencies](#การ-install-dependencies)
  - [Backend Dependencies](#backend-dependencies)
  - [Frontend Dependencies](#frontend-dependencies)
- [วิธีการ Run](#วิธีการ-run)
  - [Docker](#-docker)
  - [รันแยกกัน](#รันแยกกัน)
- [Environment Variables](#environment-variables)
  - [Environment Variables Backend](#environment-variables-backend-)
  - [Environment Variables Frontend](#environment-variables-frontend)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [เอกสาร API](#เอกสาร-api)


## สิ่งที่ทำไปแล้ว

### Core หลัก

**Backend API:**
- RESTful API สำหรับการจัดการข้อมูลตำแหน่ง
- CRUD เต็มรูปแบบ: List/Get, Create, Update, Delete
- ข้อมูลตำแหน่งแต่ละรายการเป็นไปตามรูปแบบ GeoJSON Feature
- ออกแบบเส้นทาง API (API paths) และ HTTP methods ที่เหมาะสมตามหลักการ RESTful
- Response ทั้งหมดอยู่ในรูปแบบ JSON
- Postman Collection สำหรับการทดสอบ API ทุก Endpoint (ดูที่ `Mini Spatial Data Platform.postman_collection.json`)

**Frontend:**
- ดึงข้อมูลจาก Backend API (ไม่มีการใช้ข้อมูล Mock)
- แสดงรายการตำแหน่งในรูปแบบตาราง
- แสดงตำแหน่งบนแผนที่แบบโต้ตอบโดยใช้ MapLibre GL
-  สามารถเพิ่มและลบข้อมูลตำแหน่งผ่าน UI
- Flow สมบูรณ์ตั้งแต่การดึงข้อมูล API ไปจนถึงการแสดงผลบนตาราง/แผนที่ และการเพิ่ม/ลบข้อมูล

### Bonus Feature
- แก้ไขข้อมูลตำแหน่ง (Edit)
- Pagination
- โหมดการรับชมที่หลากหลาย: โหมดแผนที่, โหมดตาราง และโหมดแบ่งหน้าจอ (ปรับขนาดได้)
- การสร้างตำแหน่งผ่านแผนที่ (คลิกเพื่อเพิ่มจุด)
- Docker สำหรับการทำ Containerization
- HeatMap เพื่อดูความหนาแน่นของจุดสถานที่

### Tech Stack

**Backend:**
- ภาษา: Go 1.25
- เว็บเฟรมเวิร์ก: Echo v4.15.1
- ฐานข้อมูล: MongoDB
- เพิ่มเติม: Uber Dig สำหรับการจัดการ Dependency Injection

**Frontend:**
- เฟรมเวิร์ก: React 19.2.4
- ไลบรารีแผนที่: MapLibre GL v5.23.0
- State Management: Zustand v5.0.12

---

## Feature

### Frontend

- **การแสดงผลแผนที่แบบโต้ตอบ (Interactive Map Visualization)**
  - ฟังก์ชันคลิกเพื่อเลือกเพื่อดูรายละเอียดตำแหน่ง
  - การสร้างตำแหน่งผ่านแผนที่ (คลิกเพื่อเพิ่มพิกัด)

- **การจัดการข้อมูล (Data Management)**
  - ตารางแสดงผลข้อมูลที่สามารถจัดเรียงและแบ่งหน้าได้
  - ปฏิบัติการ Create, Read, Update, Delete (CRUD) ครบถ้วน
  - ป๊อปอัพ (Modal) สำหรับการเพิ่มและแก้ไขตำแหน่ง
  - กล่องยืนยันสำหรับการลบข้อมูล
  - การซิงค์ข้อมูลแบบเรียลไทม์

- **อินเทอร์เฟซผู้ใช้ (User Interface)**
  - เรองรับ Responsive พร้อมโหมดการรับชมหลายรูปแบบ:
    - แสดงเฉพาะแผนที่
    - แสดงเฉพาะตาราง
    - โหมดแบ่งหน้าจอ (ปรับขนาดหน้าต่างได้)
  - ปุ่มควบคุมข้อมูลแบบแบ่งหน้า (Pagination)
  - ระบบนำทางและปุ่มควบคุมที่ใช้งานง่าย
  - HeatMap เพื่อดูความหนาแน่นของจุดสถานที่

### ฟีเจอร์ของ Backend

- **RESTful API**
  - พัฒนาด้วย Echo web framework
  - สถาปัตยกรรมแบบ Clean Architecture พร้อมการออกแบบตามโดเมน (DDD)
  - จัดการ Request/Response ในรูปแบบ JSON

- **การจัดการตำแหน่ง (Location Management)**
  - ปฏิบัติการ CRUD สำหรับข้อมูลตำแหน่ง
  - การดึงข้อมูลแบบแบ่งหน้า (Paginated retrieval)
  - การจัดเก็บพิกัดเชิงพื้นที่ (ลองจิจูด, ละติจูด)
  - การแบ่งหมวดหมู่ตามประเภท

- **การจัดการ Dependency Injection**
  - ใช้ Uber Dig เพื่อการจัดการ Dependency ที่เป็นระเบียบ
  - สถาปัตยกรรมบริการแบบโมดูล (Modular service architecture)

---

## การติดตั้ง

### สิ่งที่ต้องมีก่อน (Prerequisites)

- **Backend**:
  - Go 1.25 หรือสูงกว่า
  - MongoDB (แบบติดตั้งในเครื่องหรือ Remote)

- **Frontend**:
  - Node.js 20 หรือสูงกว่า
  - ระบบจัดการแพ็กเกจ npm หรือ yarn

- **Docker** (ไม่บังคับ):
  - Docker Desktop หรือ Docker Engine
  - Docker Compose

### การคัดลอกโปรเจค (Clone the Repository)

```bash
git clone <repository-url>
cd SpatialDataPlatform
```

---

## การ Install Dependencies

### Backend Dependencies

ติดตั้ง dependencies ของ backend:

```bash
cd backend
go mod download
```

### Frontend Dependencies

ติดตั้ง dependencies ของ frontend:

```bash
cd frontend
npm install
```

---

## วิธีการ Run

###  Docker

วิธีที่ง่ายที่สุดในการรันแอปพลิเคชันทั้งหมดคือการใช้ Docker Compose

1. **ตั้งค่าไฟล์สภาพแวดล้อม (Environment files)**:

   สร้างไฟล์ `.env` ในทั้งไดเรกทอรี backend และ frontend:

   ```bash
   # สำหรับ Backend .env
   cp backend/.env.example backend/.env
   
   # สำหรับ Frontend .env
   cp frontend/.env.example frontend/.env
   ```

2. **อัปเดตตัวแปรสภาพแวดล้อม** (ดูในส่วน [ตัวแปรสภาพแวดล้อม](#ตัวแปรสภาพแวดล้อม-environment-variables))

3. **เริ่มการทำงานของแอปพลิเคชัน**:

   ```bash
   docker-compose up --build
   ```

4. **เข้าใช้งานแอปพลิเคชัน**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

5. **หยุดการทำงานของแอปพลิเคชัน**:

   ```bash
   docker-compose down
   ```

### รันแยกกัน

#### Backend

1. **เข้าไปยังไดเรกทอรี backend**:

   ```bash
   cd backend
   ```

2. **สร้างไฟล์สภาพแวดล้อม**:

   ```bash
   cp .env.example .env
   ```

3. **ตั้งค่าตัวแปรสภาพแวดล้อม** (ดูในส่วน [ตัวแปรสภาพแวดล้อม](#ตัวแปรสภาพแวดล้อม-environment-variables))

4. **รันเซิร์ฟเวอร์ backend**:

   ```bash
   go run cmd/main.go
   ```

#### Frontend

1. **เข้าไปยังไดเรกทอรี frontend**:

   ```bash
   cd frontend
   ```

2. **สร้างไฟล์สภาพแวดล้อม**:

   ```bash
   cp .env.example .env
   ```

3. **ตั้งค่าตัวแปรสภาพแวดล้อม** (ดูในส่วน [ตัวแปรสภาพแวดล้อม](#ตัวแปรสภาพแวดล้อม-environment-variables))

4. **รันเซิร์ฟเวอร์ frontend**:

   ```bash
   npm run dev
   ```

5. **เข้าใช้งานแอปพลิเคชัน**:

   เปิดเบราว์เซอร์แล้วไปยัง http://localhost:3000

---

## Environment Variables

### Environment Variables Backend 

สร้างไฟล์ `.env` ในไดเรกทอรี `backend/` พร้อมตัวแปรดังต่อไปนี้:

| ตัวแปร | จำเป็นต้องมี | ค่าเริ่มต้น | รายละเอียด |
|----------|----------|---------|-------------|
| `PORT` | ไม่ | 8080 | หมายเลขพอร์ตสำหรับเซิร์ฟเวอร์ backend |
| `MONGO_URI` | ใช่ | - | สตริงการเชื่อมต่อ MongoDB (Connection string) |
| `DB_NAME` | ใช่ | - | ชื่อของฐานข้อมูล MongoDB |

ตัวอย่างไฟล์ `.env`:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017
DB_NAME=spatial_db
```

### Environment Variables Frontend


สร้างไฟล์ `.env` ในไดเรกทอรี `frontend/` พร้อมตัวแปรดังต่อไปนี้:

| ตัวแปร | จำเป็นต้องมี | ค่าเริ่มต้น | รายละเอียด |
|----------|----------|---------|-------------|
| `FRONTEND_PORT` | ไม่ | 80 | หมายเลขพอร์ตสำหรับเซิร์ฟเวอร์ frontend |
| `BACKEND_BASE_URL` | ใช่ | - | URL หลักสำหรับ Backend API |

ตัวอย่างไฟล์ `.env`:

```env
FRONTEND_PORT=80
BACKEND_BASE_URL=http://localhost:8080/v1
```

---

## โครงสร้างโปรเจค

```
SpatialDataPlatform/
├── backend/
│   ├── cmd/
│   │   ├── main.go           # จุดเริ่มต้นการทำงานของแอปพลิเคชัน
│   │   └── route.go          # การกำหนดเส้นทาง (Route definitions)
│   ├── internal/
│   │   ├── config/           # การจัดการการตั้งค่า
│   │   ├── di/               # การจัดการ Dependency injection
│   │   ├── domain/
│   │   │   └── location/     # โลจิกในโดเมนของตำแหน่ง (Location)
│   │   ├── interfaces/       # การกำหนด Interface
│   │   ├── middleware/       # HTTP middleware
│   │   ├── models/           # รูปแบบข้อมูล (Data models)
│   │   └── util/             # ฟังก์ชันอรรถประโยชน์
│   ├── Dockerfile            # การตั้งค่า Docker ของ Backend
│   ├── go.mod                # การกำหนดโมดูลของ Go
│   └── .env.example          # เทมเพลตตัวแปรสภาพแวดล้อม
├── frontend/
│   ├── src/
│   │   ├── components/       # คอมโพเนนต์ของ React
│   │   ├── services/         # บริการจัดการ API
│   │   ├── store/            # การจัดการสถานะ (State management)
│   │   ├── types.ts          # การกำหนดชนิดตัวแปร TypeScript
│   │   ├── App.tsx           # คอมโพเนนต์หลักของแอปพลิเคชัน
│   │   └── main.tsx          # จุดเริ่มต้นการทำงานของแอปพลิเคชัน
│   ├── public/               # ทรัพยากรไฟล์ Static
│   ├── Dockerfile            # การตั้งค่า Docker ของ Frontend
│   ├── package.json          # รายการ dependencies ของ NPM
│   └── .env.example          # เทมเพลตตัวแปรสภาพแวดล้อม
├── docker-compose.yml        # การตั้งค่า Docker Compose
└── README.md                 # ไฟล์นี้
```

---

## เอกสาร API

สำหรับเอกสาร API ที่ครบถ้วนและการทดสอบ กรุณาดูที่ Postman collection:

`Mini Spatial Data Platform.postman_collection.json`

คอลเลกชันนี้รวม Endpoint ทั้งหมดที่มี:
- รายการตำแหน่ง (พร้อมระบบแบ่งหน้า)
- สร้างตำแหน่ง
- อัปเดตตำแหน่ง
- ลบตำแหน่ง

