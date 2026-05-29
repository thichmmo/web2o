# Thích Cừu - Facebook 2-Video Carousel Tool

Tool đăng 2 video dạng carousel lên Facebook với giao diện hiện đại và dễ sử dụng.

## 🏗️ Kiến trúc

```
claude/
├── server/          # Backend API (Node.js + Express + PostgreSQL)
├── frontend/        # User Frontend (React + Vite + TailwindCSS)
├── admin/           # Admin Panel (React + Vite + TailwindCSS)
└── shared/          # Shared utilities
```

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

## 🚀 Cài đặt

### 1. Clone và cài dependencies

```bash
# Cài dependencies cho tất cả apps
cd claude/server && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

### 2. Setup Database

```bash
# Tạo database PostgreSQL
createdb thichcuu_fb_tool

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE thichcuu_fb_tool;
\q
```

### 3. Cấu hình môi trường

```bash
# Copy .env.example
cp server/.env.example server/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env

# Sửa server/.env với thông tin database của bạn
```

### 4. Chạy migrations

```bash
cd server
npx sequelize-cli db:migrate
```

### 5. Tạo admin user đầu tiên

```bash
cd server
npm run seed:admin
```

## 🧪 Test Phase 2-3

```bash
cd claude
./test-phase-2-3.sh
```

Script này sẽ:
- ✅ Kiểm tra .env file
- ✅ Test database connection
- ✅ Chạy migrations
- ✅ Báo cáo kết quả

## 🎯 Chạy ứng dụng

### Development mode

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend (User + Admin /admin)
cd frontend
npm run dev
```

Truy cập:
- Frontend: http://localhost:5173
- Admin: http://localhost:5173/admin
- API: http://localhost:3001

## 📦 Build Production

```bash
# Build frontend
cd frontend && npm run build

# Start server
cd server && npm start
```

## 🔐 Default Admin Account

Sau khi chạy seed:
- Email: `admin@thichcuu.com`
- Password: `Admin@123456`

**⚠️ Đổi password ngay sau khi login lần đầu!**

## 📚 API Documentation

Xem file `server/API.md` để biết chi tiết về các endpoints.

## 🧩 Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT Authentication
- Multer (file upload)
- Winston (logging)

### Frontend
- React 18
- Vite
- TailwindCSS
- Redux Toolkit
- React Query
- Axios

### Admin
- React 18
- Vite
- TailwindCSS
- Recharts (analytics)

## 📝 Development Phases

- [x] Phase 1: Planning & Architecture
- [x] Phase 2: Project Structure
- [x] Phase 3: Database Setup
- [ ] Phase 4-8: Authentication System
- [ ] Phase 9: Facebook Integration
- [ ] Phase 10: Video Upload
- [ ] Phase 11-12: Post Workflow
- [ ] Phase 13: History & Logs
- [ ] Phase 14: Admin Panel
- [ ] Phase 15-17: Security & Testing
- [ ] Phase 18-20: Plan System

## 🐛 Troubleshooting

### Database connection failed
```bash
# Check PostgreSQL is running
pg_isready

# Check credentials in server/.env
cat server/.env | grep DB_
```

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or change port in server/.env
PORT=3001
```

### Migration errors
```bash
# Rollback last migration
cd server
npx sequelize-cli db:migrate:undo

# Rollback all
npx sequelize-cli db:migrate:undo:all

# Re-run
npx sequelize-cli db:migrate
```

## 📖 Tài liệu thêm

- [HANDOVER.md](./HANDOVER.md) - Chi tiết kiến trúc và kế hoạch
- [server/API.md](./server/API.md) - API documentation
- [.claude/docs/](../.claude/docs/) - Planning documents

## 🤝 Contributing

Đây là project nội bộ. Mọi thay đổi cần được review trước khi merge.

## 📄 License

Private - All rights reserved
