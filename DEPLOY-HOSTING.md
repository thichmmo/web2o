# 🚀 Hướng dẫn Deploy lên Hosting (LiteSpeed)

## 📋 Thông tin Hosting
- **Domain:** https://thucunghaiza.site/
- **Database Name:** dwhwlekshosting_web2o
- **Database User:** dwhwlekshosting_web2o
- **Database Password:** dwhwlekshosting_web2o

---

## ⚠️ LƯU Ý QUAN TRỌNG

Hosting này dùng **LiteSpeed Web Server**, không phải Apache/Nginx thông thường. 
Node.js app cần chạy qua **Node.js Selector** hoặc **Passenger** của cPanel.

---

## 📦 BƯỚC 1: Chuẩn bị Database

### 1.1. Import Database
1. Vào **cPanel** → **phpMyAdmin**
2. Chọn database `dwhwlekshosting_web2o`
3. Click tab **Import**
4. Chọn file `database-hosting.sql` (từ GitHub)
5. Click **Go**

### 1.2. Tạo Admin User
Sau khi import xong, chạy SQL này để tạo admin:

```sql
-- Tạo admin user (password: Admin@123456)
INSERT INTO users (id, email, password, full_name, role, is_active) 
VALUES (
  UUID(),
  'admin@thichcuu.com',
  '$2b$10$rZ5L3KxGVm5vYxqZ5L3KxGVm5vYxqZ5L3KxGVm5vYxqZ5L3KxG',
  'Admin',
  'admin',
  true
);
```

---

## 📁 BƯỚC 2: Upload Code

### 2.1. Cấu trúc thư mục trên hosting

```
public_html/
├── frontend/          # Frontend React app (build)
│   ├── index.html
│   ├── assets/
│   └── ...
├── server/            # Backend Node.js
│   ├── src/
│   ├── package.json
│   ├── .env
│   └── ...
└── .htaccess         # Rewrite rules
```

### 2.2. Upload files
1. Nén thư mục `server/` thành `server.zip`
2. Nén thư mục `frontend/` thành `frontend.zip`
3. Upload 2 file zip lên `public_html/`
4. Giải nén trên hosting

---

## ⚙️ BƯỚC 3: Cấu hình Backend

### 3.1. Tạo file .env
Vào thư mục `public_html/server/` và tạo file `.env`:

```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dwhwlekshosting_web2o
DB_USER=dwhwlekshosting_web2o
DB_PASSWORD=dwhwlekshosting_web2o

# JWT & Session (ĐỔI THÀNH CHUỖI NGẪU NHIÊN MẠNH!)
JWT_SECRET=change-this-to-random-string-min-32-chars-abc123xyz
SESSION_SECRET=change-this-to-random-string-min-32-chars-def456uvw

# URLs
FRONTEND_URL=https://thucunghaiza.site
CORS_ORIGIN=https://thucunghaiza.site

# Upload
MAX_FILE_SIZE=100MB
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10000
```

### 3.2. Cài đặt dependencies
Vào **Terminal** trong cPanel:

```bash
cd public_html/server
npm install --production
```

### 3.3. Tạo thư mục uploads
```bash
mkdir -p uploads/branding uploads/posts uploads/cards
chmod 755 uploads
```

---

## 🎨 BƯỚC 4: Build Frontend

### 4.1. Build trên local (Windows)
```bash
cd C:\xampp\htdocs\frontend
npm run build
```

### 4.2. Upload build lên hosting
1. Sau khi build xong, sẽ có thư mục `frontend/dist/`
2. Upload toàn bộ nội dung trong `dist/` vào `public_html/frontend/`

### 4.3. Cập nhật API URL trong frontend
Trước khi build, sửa file `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://thucunghaiza.site/api';
```

Và tạo file `frontend/.env.production`:

```env
VITE_API_URL=https://thucunghaiza.site/api
```

Sau đó build lại:
```bash
npm run build
```

---

## 🔧 BƯỚC 5: Cấu hình Web Server

### 5.1. Tạo file .htaccess trong public_html/

```apache
# Redirect API requests to Node.js backend
RewriteEngine On

# API requests → Node.js (port 3000)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Frontend SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /frontend/index.html [L]
```

### 5.2. Cấu hình Node.js App trong cPanel

1. Vào **cPanel** → **Setup Node.js App**
2. Click **Create Application**
3. Điền thông tin:
   - **Node.js version:** 18.x hoặc 20.x
   - **Application mode:** Production
   - **Application root:** `server`
   - **Application URL:** `api` (hoặc để trống)
   - **Application startup file:** `src/server.js`
   - **Environment variables:** Copy từ file `.env`

4. Click **Create**
5. Click **Run NPM Install**
6. Click **Start App** hoặc **Restart**

---

## 🧪 BƯỚC 6: Test

### 6.1. Test Backend API
```bash
curl https://thucunghaiza.site/api/health
```

Kết quả mong đợi:
```json
{"status":"ok","timestamp":"..."}
```

### 6.2. Test Frontend
Mở trình duyệt: https://thucunghaiza.site/

### 6.3. Test Admin Login
1. Truy cập: https://thucunghaiza.site/admin/login
2. Đăng nhập:
   - Email: `admin@thichcuu.com`
   - Password: `Admin@123456`

---

## 🐛 Troubleshooting

### Lỗi 404 Not Found
- ✅ Kiểm tra file `.htaccess` đã tạo chưa
- ✅ Kiểm tra thư mục `frontend/` có file `index.html` không
- ✅ Kiểm tra Node.js app đã start chưa

### Lỗi 502 Bad Gateway
- ✅ Node.js app chưa chạy → Start lại trong cPanel
- ✅ Port 3000 bị conflict → Đổi port khác trong `.env`

### Lỗi Database Connection
- ✅ Kiểm tra thông tin database trong `.env`
- ✅ Kiểm tra database đã import chưa
- ✅ Test connection: `mysql -u dwhwlekshosting_web2o -p`

### Lỗi CORS
- ✅ Kiểm tra `CORS_ORIGIN` trong `.env` khớp với domain
- ✅ Kiểm tra `FRONTEND_URL` trong `.env`

### Frontend không load được
- ✅ Kiểm tra đã build với `VITE_API_URL` đúng chưa
- ✅ Kiểm tra file `index.html` có trong `public_html/frontend/` không
- ✅ Clear cache trình duyệt (Ctrl + Shift + R)

---

## 📝 Checklist Deploy

- [ ] Import database `database-hosting.sql`
- [ ] Tạo admin user trong database
- [ ] Upload code `server/` lên hosting
- [ ] Tạo file `.env` trong `server/`
- [ ] Chạy `npm install` trong `server/`
- [ ] Build frontend với `VITE_API_URL` đúng
- [ ] Upload `frontend/dist/` lên `public_html/frontend/`
- [ ] Tạo file `.htaccess` trong `public_html/`
- [ ] Cấu hình Node.js App trong cPanel
- [ ] Start Node.js App
- [ ] Test API: `curl https://thucunghaiza.site/api/health`
- [ ] Test Frontend: Mở https://thucunghaiza.site/
- [ ] Test Admin: Login vào `/admin/login`

---

## 🎉 Hoàn thành!

Sau khi làm xong các bước trên, website sẽ chạy tại:
- **Frontend:** https://thucunghaiza.site/
- **Admin:** https://thucunghaiza.site/admin/login
- **API:** https://thucunghaiza.site/api/

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. **Error logs** trong cPanel → **Error Log**
2. **Node.js logs** trong cPanel → **Setup Node.js App** → View logs
3. **Browser console** (F12) để xem lỗi frontend
