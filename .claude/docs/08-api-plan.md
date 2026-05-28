# API PLAN - THÍCH CỪU FACEBOOK VIDEO 2 Ô TOOL

## 1. TỔNG QUAN API

### 1.1. Base URL

**Development:**
```
http://localhost:3000/api/v1
```

**Production:**
```
https://api.thichcuu.com/v1
hoặc
https://thichcuu.com/api/v1
```

### 1.2. API Versioning

- Version hiện tại: `v1`
- Format: `/api/v1/{resource}`
- Khi có breaking changes, tạo version mới: `/api/v2/{resource}`
- Maintain cả 2 versions trong thời gian transition (3-6 tháng)

### 1.3. Authentication Mechanism

**JWT (JSON Web Token):**
- Access Token: Short-lived (15 minutes)
- Refresh Token: Long-lived (7 days)
- Lưu access token trong memory (frontend state)
- Lưu refresh token trong httpOnly cookie

**Header format:**
```
Authorization: Bearer {access_token}
```

**Token refresh flow:**
```
POST /api/v1/auth/refresh
Cookie: refresh_token={token}
→ Response: { access_token, refresh_token }
```

### 1.4. Response Format Chuẩn

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation successful",
  "timestamp": "2026-05-25T14:30:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error details
    }
  },
  "timestamp": "2026-05-25T14:30:00Z"
}
```

### 1.5. Pagination Format Chuẩn

**Request:**
```
GET /api/v1/posts?page=1&limit=20&sort=created_at:desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 234,
      "total_pages": 12,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 1.6. Permission Rules Chuẩn

**Ownership Check:**
- User chỉ truy cập resources có `user_id` = user hiện tại
- Admin có thể truy cập tất cả resources
- Super Admin có thể truy cập và modify tất cả

**Role Hierarchy:**
```
super_admin > admin > user
```

**Permission Check Order:**
1. Authentication (JWT valid?)
2. Authorization (Role có quyền?)
3. Ownership (Resource thuộc user?)

---

## 2. AUTH APIs

### 2.1. Đăng ký

**Endpoint:** `POST /api/v1/auth/register`

**Mục đích:** Tạo tài khoản user mới

**Role:** Public (không cần auth)

**Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "Nguyễn Văn A"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "status": "pending"
    },
    "message": "Registration successful. Please check your email to verify."
  }
}
```

**Error Cases:**
- `400 VALIDATION_ERROR`: Email/username invalid
- `409 EMAIL_EXISTS`: Email đã tồn tại
- `409 USERNAME_EXISTS`: Username đã tồn tại
- `400 WEAK_PASSWORD`: Password không đủ mạnh

**Backend Module:** `server/src/controllers/auth.controller.js`

**Test Cases:**
- ✅ Register với data hợp lệ
- ❌ Register với email đã tồn tại
- ❌ Register với username đã tồn tại
- ❌ Register với password yếu
- ❌ Register với email invalid
- ✅ Verify email được gửi

---

### 2.2. Đăng nhập

**Endpoint:** `POST /api/v1/auth/login`

**Mục đích:** Đăng nhập và nhận JWT tokens

**Role:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "user",
      "avatar_url": null
    }
  }
}
```

**Error Cases:**
- `401 INVALID_CREDENTIALS`: Email/password sai
- `403 ACCOUNT_BANNED`: Tài khoản bị khóa
- `403 ACCOUNT_INACTIVE`: Tài khoản chưa active
- `403 EMAIL_NOT_VERIFIED`: Email chưa verify
- `429 TOO_MANY_ATTEMPTS`: Quá nhiều lần thử

**Backend Module:** `server/src/controllers/auth.controller.js`

**Test Cases:**
- ✅ Login với credentials đúng
- ❌ Login với password sai
- ❌ Login với email không tồn tại
- ❌ Login với account bị banned
- ❌ Login với account inactive
- ✅ Tokens được generate đúng
- ✅ Session được lưu vào DB

---

### 2.3. Đăng xuất

**Endpoint:** `POST /api/v1/auth/logout`

**Mục đích:** Đăng xuất và revoke tokens

**Role:** Authenticated user

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:** (empty)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `401 INVALID_TOKEN`: Token không hợp lệ

**Backend Module:** `server/src/controllers/auth.controller.js`

**Test Cases:**
- ✅ Logout thành công
- ✅ Session bị xóa khỏi DB
- ✅ Token không dùng được sau logout
- ❌ Logout không có token

---

### 2.4. Lấy thông tin user hiện tại

**Endpoint:** `GET /api/v1/auth/me`

**Mục đích:** Lấy thông tin user đang đăng nhập

**Role:** Authenticated user

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "user",
      "status": "active",
      "avatar_url": null,
      "email_verified": true,
      "created_at": "2026-03-15T10:00:00Z",
      "last_login_at": "2026-05-25T14:30:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `401 INVALID_TOKEN`: Token không hợp lệ
- `401 TOKEN_EXPIRED`: Token đã hết hạn

**Backend Module:** `server/src/controllers/auth.controller.js`

**Test Cases:**
- ✅ Get user info với token hợp lệ
- ❌ Get user info không có token
- ❌ Get user info với token expired

---

### 2.5. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Mục đích:** Làm mới access token

**Role:** Authenticated user (với refresh token)

**Request:**
```
Cookie: refresh_token={refresh_token}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

**Error Cases:**
- `401 REFRESH_TOKEN_REQUIRED`: Không có refresh token
- `401 INVALID_REFRESH_TOKEN`: Refresh token không hợp lệ
- `401 REFRESH_TOKEN_EXPIRED`: Refresh token đã hết hạn

**Backend Module:** `server/src/controllers/auth.controller.js`

**Test Cases:**
- ✅ Refresh token thành công
- ✅ Access token mới hoạt động
- ❌ Refresh với token expired
- ❌ Refresh với token invalid

---

### 2.6. Đổi mật khẩu

**Endpoint:** `PUT /api/v1/auth/password`

**Mục đích:** Đổi mật khẩu cho user đang đăng nhập

**Role:** Authenticated user

**Request Body:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!",
  "confirm_password": "NewPass456!"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `401 INVALID_CURRENT_PASSWORD`: Mật khẩu hiện tại sai
- `400 WEAK_PASSWORD`: Mật khẩu mới không đủ mạnh
- `400 PASSWORD_MISMATCH`: Confirm password không khớp

**Backend Module:** `server/src/controllers/auth.controller.js`

**Side Effects:**
- Revoke tất cả sessions hiện tại
- User phải đăng nhập lại
- Gửi email thông báo đổi password

**Test Cases:**
- ✅ Đổi password thành công
- ✅ Tất cả sessions bị revoke
- ❌ Đổi với current password sai
- ❌ Đổi với new password yếu
- ✅ Email notification được gửi

---

### 2.7. Quên mật khẩu

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Mục đích:** Gửi email reset password

**Role:** Public

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent."
}
```

**Error Cases:**
- `429 TOO_MANY_REQUESTS`: Quá nhiều requests

**Backend Module:** `server/src/controllers/auth.controller.js`

**Note:** 
- Luôn return success message (không leak thông tin email có tồn tại hay không)
- Rate limit: 3 requests/15 minutes per IP

**Test Cases:**
- ✅ Request với email tồn tại → email được gửi
- ✅ Request với email không tồn tại → vẫn return success
- ❌ Request quá nhiều lần → rate limited

---

### 2.8. Reset mật khẩu

**Endpoint:** `POST /api/v1/auth/reset-password`

**Mục đích:** Reset password với token từ email

**Role:** Public

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewPass123!",
  "confirm_password": "NewPass123!"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login."
}
```

**Error Cases:**
- `400 INVALID_TOKEN`: Token không hợp lệ
- `400 TOKEN_EXPIRED`: Token đã hết hạn (>1 hour)
- `400 WEAK_PASSWORD`: Password không đủ mạnh
- `400 PASSWORD_MISMATCH`: Confirm password không khớp

**Backend Module:** `server/src/controllers/auth.controller.js`

**Test Cases:**
- ✅ Reset với token hợp lệ
- ❌ Reset với token expired
- ❌ Reset với token invalid
- ❌ Reset với password yếu

---

### 2.9. Verify Email

**Endpoint:** `GET /api/v1/auth/verify-email?token={token}`

**Mục đích:** Xác nhận email sau khi đăng ký

**Role:** Public

**Response Success (200):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

**Error Cases:**
- `400 INVALID_TOKEN`: Token không hợp lệ
- `400 TOKEN_EXPIRED`: Token đã hết hạn
- `400 ALREADY_VERIFIED`: Email đã được verify

**Backend Module:** `server/src/controllers/auth.controller.js`

**Test Cases:**
- ✅ Verify với token hợp lệ
- ✅ User status chuyển sang 'active'
- ❌ Verify với token expired
- ❌ Verify lần 2

---

## 3. USER APIs

### 3.1. Lấy Profile User

**Endpoint:** `GET /api/v1/user/profile`

**Mục đích:** Lấy thông tin profile của user hiện tại

**Role:** Authenticated user

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "avatar_url": "https://...",
      "role": "user",
      "status": "active",
      "email_verified": true,
      "created_at": "2026-03-15T10:00:00Z",
      "last_login_at": "2026-05-25T14:30:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token

**Backend Module:** `server/src/controllers/user.controller.js`

**Test Cases:**
- ✅ Get profile thành công
- ❌ Get profile không có auth

---

### 3.2. Cập nhật Profile

**Endpoint:** `PUT /api/v1/user/profile`

**Mục đích:** Cập nhật thông tin profile

**Role:** Authenticated user

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn B",
  "avatar_url": "https://..."
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn B",
      "avatar_url": "https://...",
      "updated_at": "2026-05-25T14:35:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `400 VALIDATION_ERROR`: Data không hợp lệ

**Backend Module:** `server/src/controllers/user.controller.js`

**Note:** Không cho phép sửa email, username, role

**Test Cases:**
- ✅ Update full_name
- ✅ Update avatar_url
- ❌ Update email (should be rejected)
- ❌ Update role (should be rejected)

---

### 3.3. Lấy Settings User

**Endpoint:** `GET /api/v1/user/settings`

**Mục đích:** Lấy cài đặt của user

**Role:** Authenticated user

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "notifications_enabled": true,
      "email_on_post_success": true,
      "email_on_post_failure": true,
      "default_page_id": "123456",
      "default_ad_account_id": "act_789",
      "timezone": "Asia/Ho_Chi_Minh",
      "language": "vi"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token

**Backend Module:** `server/src/controllers/user.controller.js`

**Test Cases:**
- ✅ Get settings thành công

---

### 3.4. Cập nhật Settings

**Endpoint:** `PUT /api/v1/user/settings`

**Mục đích:** Cập nhật cài đặt

**Role:** Authenticated user

**Request Body:**
```json
{
  "notifications_enabled": false,
  "email_on_post_success": false,
  "timezone": "Asia/Bangkok"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "notifications_enabled": false,
      "email_on_post_success": false,
      "email_on_post_failure": true,
      "timezone": "Asia/Bangkok",
      "updated_at": "2026-05-25T14:40:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `400 VALIDATION_ERROR`: Data không hợp lệ

**Backend Module:** `server/src/controllers/user.controller.js`

**Test Cases:**
- ✅ Update settings thành công
- ❌ Update với timezone invalid

---

## 4. FACEBOOK CONNECTION APIs

### 4.1. Kết nối Facebook (Manual Token)

**Endpoint:** `POST /api/v1/facebook/connect`

**Mục đích:** Kết nối Facebook bằng access token thủ công

**Role:** Authenticated user

**Request Body:**
```json
{
  "access_token": "EAAxxxxxxxxxxxxx"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "facebook_account": {
      "facebook_id": "1234567890",
      "facebook_name": "Nguyễn Văn A",
      "connected_at": "2026-05-25T14:45:00Z",
      "token_expires_at": "2026-07-25T00:00:00Z"
    },
    "pages": [
      {
        "page_id": "123456",
        "page_name": "My Fanpage",
        "followers_count": 123000
      }
    ],
    "ad_accounts": [
      {
        "ad_account_id": "act_789",
        "ad_account_name": "Ad Account 1"
      }
    ]
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `400 INVALID_FB_TOKEN`: Facebook token không hợp lệ
- `400 FB_TOKEN_EXPIRED`: Facebook token đã hết hạn
- `403 FB_PERMISSION_MISSING`: Thiếu permissions cần thiết

**Backend Module:** `server/src/controllers/facebook.controller.js`

**Security:**
- ⚠️ Token được encrypt (AES-256-GCM) trước khi lưu DB
- ⚠️ Không log token thô
- ⚠️ Không trả token thô về frontend

**Test Cases:**
- ✅ Connect với token hợp lệ
- ✅ Token được encrypt trong DB
- ✅ Pages và ad accounts được fetch
- ❌ Connect với token invalid
- ❌ Connect với token thiếu permissions

---

### 4.2. Kết nối Facebook (OAuth)

**Endpoint:** `POST /api/v1/facebook/oauth/callback`

**Mục đích:** Xử lý OAuth callback từ Facebook

**Role:** Authenticated user

**Request Body:**
```json
{
  "code": "oauth_code_from_facebook",
  "state": "random_state_token"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "facebook_account": {
      "facebook_id": "1234567890",
      "facebook_name": "Nguyễn Văn A",
      "connected_at": "2026-05-25T14:45:00Z",
      "token_expires_at": "2026-07-25T00:00:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `400 INVALID_STATE`: State token không khớp
- `400 OAUTH_ERROR`: Lỗi từ Facebook OAuth

**Backend Module:** `server/src/controllers/facebook.controller.js`

**Test Cases:**
- ✅ OAuth flow thành công
- ❌ OAuth với state invalid
- ❌ OAuth với code expired

---

### 4.3. Kiểm tra trạng thái kết nối

**Endpoint:** `GET /api/v1/facebook/status`

**Mục đích:** Kiểm tra trạng thái kết nối Facebook

**Role:** Authenticated user

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "facebook_account": {
      "facebook_id": "1234567890",
      "facebook_name": "Nguyễn Văn A",
      "connected_at": "2026-05-25T14:45:00Z",
      "token_expires_at": "2026-07-25T00:00:00Z",
      "token_valid": true
    }
  }
}
```

**Response (Not Connected):**
```json
{
  "success": true,
  "data": {
    "connected": false
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token

**Backend Module:** `server/src/controllers/facebook.controller.js`

**Test Cases:**
- ✅ Check status khi đã connect
- ✅ Check status khi chưa connect
- ✅ Check token validity

---

### 4.4. Lấy danh sách Pages

**Endpoint:** `GET /api/v1/facebook/pages`

**Mục đích:** Lấy danh sách Facebook Pages

**Role:** Authenticated user (đã kết nối Facebook)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "page_id": "123456",
        "page_name": "My Fanpage",
        "page_picture_url": "https://...",
        "followers_count": 123000,
        "is_published": true
      },
      {
        "page_id": "789012",
        "page_name": "Business Page",
        "page_picture_url": "https://...",
        "followers_count": 45000,
        "is_published": true
      }
    ]
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 FB_NOT_CONNECTED`: Chưa kết nối Facebook
- `401 FB_TOKEN_EXPIRED`: Facebook token hết hạn

**Backend Module:** `server/src/controllers/facebook.controller.js`

**Test Cases:**
- ✅ Get pages thành công
- ❌ Get pages khi chưa connect
- ❌ Get pages với token expired

---

### 4.5. Lấy danh sách Ad Accounts

**Endpoint:** `GET /api/v1/facebook/ad-accounts`

**Mục đích:** Lấy danh sách Facebook Ad Accounts

**Role:** Authenticated user (đã kết nối Facebook)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "ad_accounts": [
      {
        "ad_account_id": "act_123456",
        "ad_account_name": "Ad Account 1",
        "account_status": "ACTIVE",
        "currency": "VND",
        "timezone_name": "Asia/Ho_Chi_Minh"
      },
      {
        "ad_account_id": "act_789012",
        "ad_account_name": "Ad Account 2",
        "account_status": "ACTIVE",
        "currency": "USD",
        "timezone_name": "America/Los_Angeles"
      }
    ]
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 FB_NOT_CONNECTED`: Chưa kết nối Facebook
- `401 FB_TOKEN_EXPIRED`: Facebook token hết hạn

**Backend Module:** `server/src/controllers/facebook.controller.js`

**Test Cases:**
- ✅ Get ad accounts thành công
- ❌ Get ad accounts khi chưa connect
- ❌ Get ad accounts với token expired

---

### 4.6. Refresh Facebook Token

**Endpoint:** `POST /api/v1/facebook/refresh-token`

**Mục đích:** Làm mới Facebook access token

**Role:** Authenticated user

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "token_expires_at": "2026-09-25T00:00:00Z",
    "refreshed_at": "2026-05-25T14:50:00Z"
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 FB_NOT_CONNECTED`: Chưa kết nối Facebook
- `400 FB_REFRESH_FAILED`: Không thể refresh token

**Backend Module:** `server/src/controllers/facebook.controller.js`

**Test Cases:**
- ✅ Refresh token thành công
- ❌ Refresh khi chưa connect

---

### 4.7. Ngắt kết nối Facebook

**Endpoint:** `POST /api/v1/facebook/disconnect`

**Mục đích:** Ngắt kết nối Facebook

**Role:** Authenticated user

**Response Success (200):**
```json
{
  "success": true,
  "message": "Facebook disconnected successfully"
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 FB_NOT_CONNECTED`: Chưa kết nối Facebook

**Backend Module:** `server/src/controllers/facebook.controller.js`

**Side Effects:**
- Xóa Facebook account record
- Xóa pages và ad accounts
- Không xóa posts đã đăng (giữ lại history)

**Test Cases:**
- ✅ Disconnect thành công
- ✅ Facebook data bị xóa
- ✅ Posts history vẫn còn
- ❌ Disconnect khi chưa connect

---

## 5. UPLOAD/VIDEO APIs

### 5.1. Upload Video

**Endpoint:** `POST /api/v1/videos/upload`

**Mục đích:** Upload video lên server

**Role:** Authenticated user

**Request:** `multipart/form-data`
```
video: [File]
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "uuid",
      "filename": "user_123_1716624000_abc123.mp4",
      "path": "/uploads/videos/2026/05/25/user_123_1716624000_abc123.mp4",
      "size_bytes": 8600000,
      "duration_seconds": 45,
      "width": 1920,
      "height": 1080,
      "thumbnail_url": "https://...",
      "uploaded_at": "2026-05-25T14:55:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `400 NO_FILE`: Không có file trong request
- `400 INVALID_FILE_TYPE`: File type không hợp lệ (chỉ cho phép MP4, MOV, AVI)
- `400 FILE_TOO_LARGE`: File quá lớn (>500MB)
- `400 VIDEO_TOO_LONG`: Video quá dài (>5 phút)
- `400 INVALID_VIDEO`: File không phải video hợp lệ
- `429 RATE_LIMITED`: Quá nhiều uploads

**Backend Module:** `server/src/controllers/video.controller.js`

**Security:**
- Validate file type (MIME type + extension)
- Validate file size
- Validate video duration (ffmpeg)
- Scan for malware (optional)
- Rate limit: 50 uploads/hour per user

**Test Cases:**
- ✅ Upload video hợp lệ
- ✅ Thumbnail được generate
- ❌ Upload file không phải video
- ❌ Upload file quá lớn
- ❌ Upload video quá dài
- ❌ Upload quá nhiều lần

---

### 5.2. Validate Video

**Endpoint:** `POST /api/v1/videos/validate`

**Mục đích:** Validate video trước khi upload

**Role:** Authenticated user

**Request Body:**
```json
{
  "filename": "video.mp4",
  "size_bytes": 8600000
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "warnings": []
  }
}
```

**Response (Invalid):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "errors": [
      "File size exceeds 500MB limit",
      "File type not allowed"
    ]
  }
}
```

**Backend Module:** `server/src/controllers/video.controller.js`

**Test Cases:**
- ✅ Validate video hợp lệ
- ❌ Validate video quá lớn

---

### 5.3. Xóa Video

**Endpoint:** `DELETE /api/v1/videos/:id`

**Mục đích:** Xóa video đã upload

**Role:** Authenticated user (owner)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 VIDEO_NOT_FOUND`: Video không tồn tại
- `403 ACCESS_DENIED`: Video không thuộc user
- `400 VIDEO_IN_USE`: Video đang được dùng trong post

**Backend Module:** `server/src/controllers/video.controller.js`

**Test Cases:**
- ✅ Xóa video của mình
- ❌ Xóa video của user khác
- ❌ Xóa video đang được dùng

---

### 5.4. Lấy thông tin Video

**Endpoint:** `GET /api/v1/videos/:id`

**Mục đích:** Lấy thông tin chi tiết video

**Role:** Authenticated user (owner)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "uuid",
      "filename": "user_123_1716624000_abc123.mp4",
      "size_bytes": 8600000,
      "duration_seconds": 45,
      "width": 1920,
      "height": 1080,
      "thumbnail_url": "https://...",
      "uploaded_at": "2026-05-25T14:55:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 VIDEO_NOT_FOUND`: Video không tồn tại
- `403 ACCESS_DENIED`: Video không thuộc user

**Backend Module:** `server/src/controllers/video.controller.js`

---

## 6. CREATE POST APIs

### 6.1. Tạo Draft Post

**Endpoint:** `POST /api/v1/posts`

**Mục đích:** Tạo bài đăng draft (chưa publish)

**Role:** Authenticated user

**Request Body:**
```json
{
  "page_id": "123456",
  "ad_account_id": "act_789",
  "message": "Nội dung bài viết...",
  "publish": false,
  "cards": [
    {
      "card_index": 0,
      "title": "Tiêu đề ô 1",
      "description": "Mô tả ô 1",
      "link": "https://example.com/1",
      "cta_type": "LIKE_PAGE",
      "video_id": "uuid_video_1"
    },
    {
      "card_index": 1,
      "title": "Tiêu đề ô 2",
      "description": "Mô tả ô 2",
      "link": "https://example.com/2",
      "cta_type": "OPEN_LINK",
      "cta_link": "https://example.com/2",
      "video_id": "uuid_video_2"
    }
  ]
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "status": "draft",
      "page_id": "123456",
      "page_name": "My Fanpage",
      "ad_account_id": "act_789",
      "message": "Nội dung bài viết...",
      "created_at": "2026-05-25T15:00:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 FB_NOT_CONNECTED`: Chưa kết nối Facebook
- `400 VALIDATION_ERROR`: Data không hợp lệ
- `404 VIDEO_NOT_FOUND`: Video không tồn tại
- `403 VIDEO_ACCESS_DENIED`: Video không thuộc user
- `429 RATE_LIMITED`: Quá nhiều posts

**Backend Module:** `server/src/controllers/post.controller.js`

**Test Cases:**
- ✅ Tạo draft thành công
- ❌ Tạo với video không tồn tại
- ❌ Tạo với page không có quyền
- ❌ Tạo quá nhiều posts

---

### 6.2. Validate Post

**Endpoint:** `POST /api/v1/posts/validate`

**Mục đích:** Validate dữ liệu post trước khi đăng

**Role:** Authenticated user

**Request Body:** (giống như create post)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "checks": {
      "facebook_connected": true,
      "page_accessible": true,
      "ad_account_accessible": true,
      "videos_uploaded": true,
      "videos_valid": true,
      "cards_valid": true,
      "token_valid": true
    },
    "warnings": [
      "Message is empty"
    ],
    "errors": []
  }
}
```

**Response (Invalid):**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "checks": {
      "facebook_connected": true,
      "page_accessible": false,
      "token_valid": false
    },
    "errors": [
      "Page not accessible",
      "Facebook token expired"
    ]
  }
}
```

**Backend Module:** `server/src/controllers/post.controller.js`

**Test Cases:**
- ✅ Validate post hợp lệ
- ❌ Validate với token expired
- ❌ Validate với page không accessible

---

### 6.3. Publish Post (Đăng ngay)

**Endpoint:** `POST /api/v1/posts/:id/publish`

**Mục đích:** Đăng bài lên Facebook ngay lập tức

**Role:** Authenticated user (owner)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "status": "processing",
      "message": "Post is being published..."
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 POST_NOT_FOUND`: Post không tồn tại
- `403 ACCESS_DENIED`: Post không thuộc user
- `400 INVALID_STATUS`: Post không ở trạng thái draft
- `400 VALIDATION_FAILED`: Post không pass validation

**Backend Module:** `server/src/controllers/post.controller.js`

**Note:** 
- API này trigger background job để publish
- Response ngay lập tức với status "processing"
- Client poll status hoặc dùng WebSocket để nhận updates

**Test Cases:**
- ✅ Publish post thành công
- ✅ Status chuyển sang "processing"
- ✅ Background job được trigger
- ❌ Publish post của user khác
- ❌ Publish post đã published

---

### 6.4. Schedule Post (Lên lịch)

**Endpoint:** `POST /api/v1/posts/:id/schedule`

**Mục đích:** Lên lịch đăng bài

**Role:** Authenticated user (owner)

**Request Body:**
```json
{
  "scheduled_at": "2026-05-26T18:00:00Z"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "status": "scheduled",
      "scheduled_at": "2026-05-26T18:00:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 POST_NOT_FOUND`: Post không tồn tại
- `403 ACCESS_DENIED`: Post không thuộc user
- `400 INVALID_SCHEDULE_TIME`: Thời gian trong quá khứ
- `400 VALIDATION_FAILED`: Post không pass validation

**Backend Module:** `server/src/controllers/post.controller.js`

**Test Cases:**
- ✅ Schedule post thành công
- ❌ Schedule với thời gian quá khứ
- ❌ Schedule post của user khác

---

### 6.5. Cancel Scheduled Post

**Endpoint:** `DELETE /api/v1/posts/:id/schedule`

**Mục đích:** Hủy lịch đăng bài

**Role:** Authenticated user (owner)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "status": "draft",
      "scheduled_at": null
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 POST_NOT_FOUND`: Post không tồn tại
- `403 ACCESS_DENIED`: Post không thuộc user
- `400 NOT_SCHEDULED`: Post không ở trạng thái scheduled

**Backend Module:** `server/src/controllers/post.controller.js`

**Test Cases:**
- ✅ Cancel schedule thành công
- ❌ Cancel post không scheduled

---

### 6.6. Retry Failed Post

**Endpoint:** `POST /api/v1/posts/:id/retry`

**Mục đích:** Thử lại đăng bài đã failed

**Role:** Authenticated user (owner)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "status": "processing",
      "retry_count": 1
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 POST_NOT_FOUND`: Post không tồn tại
- `403 ACCESS_DENIED`: Post không thuộc user
- `400 NOT_FAILED`: Post không ở trạng thái failed
- `400 MAX_RETRIES`: Đã retry quá nhiều lần (max 3)

**Backend Module:** `server/src/controllers/post.controller.js`

**Test Cases:**
- ✅ Retry post failed
- ❌ Retry post đã success
- ❌ Retry quá 3 lần

---

## 7. POST HISTORY APIs

### 7.1. Lấy danh sách Posts

**Endpoint:** `GET /api/v1/posts`

**Mục đích:** Lấy danh sách bài đăng của user

**Role:** Authenticated user

**Query Parameters:**
```
?page=1
&limit=20
&status=posted
&page_id=123456
&date_from=2026-05-01
&date_to=2026-05-31
&sort=created_at:desc
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "page_id": "123456",
        "page_name": "My Fanpage",
        "message": "Nội dung ngắn gọn...",
        "status": "posted",
        "facebook_post_id": "123456_789012",
        "posted_at": "2026-05-25T15:00:00Z",
        "created_at": "2026-05-25T14:55:00Z",
        "videos_count": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token

**Backend Module:** `server/src/controllers/post.controller.js`

**Note:** Chỉ trả về posts của user hiện tại

**Test Cases:**
- ✅ Get posts với filters
- ✅ Pagination hoạt động
- ✅ Chỉ thấy posts của mình
- ❌ Không thấy posts của user khác

---

### 7.2. Lấy chi tiết Post

**Endpoint:** `GET /api/v1/posts/:id`

**Mục đích:** Lấy chi tiết 1 bài đăng

**Role:** Authenticated user (owner)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "page_id": "123456",
      "page_name": "My Fanpage",
      "ad_account_id": "act_789",
      "message": "Nội dung bài viết...",
      "status": "posted",
      "facebook_post_id": "123456_789012",
      "facebook_creative_id": "creative_456",
      "posted_at": "2026-05-25T15:00:00Z",
      "created_at": "2026-05-25T14:55:00Z",
      "videos": [
        {
          "card_index": 0,
          "title": "Tiêu đề ô 1",
          "description": "Mô tả ô 1",
          "link": "https://example.com/1",
          "cta_type": "LIKE_PAGE",
          "thumbnail_url": "https://...",
          "facebook_video_id": "fb_video_123"
        },
        {
          "card_index": 1,
          "title": "Tiêu đề ô 2",
          "description": "Mô tả ô 2",
          "link": "https://example.com/2",
          "cta_type": "OPEN_LINK",
          "thumbnail_url": "https://...",
          "facebook_video_id": "fb_video_456"
        }
      ]
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 POST_NOT_FOUND`: Post không tồn tại
- `403 ACCESS_DENIED`: Post không thuộc user

**Backend Module:** `server/src/controllers/post.controller.js`

**Test Cases:**
- ✅ Get detail post của mình
- ❌ Get detail post của user khác

---

### 7.3. Xóa Post

**Endpoint:** `DELETE /api/v1/posts/:id`

**Mục đích:** Xóa bài đăng

**Role:** Authenticated user (owner)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 POST_NOT_FOUND`: Post không tồn tại
- `403 ACCESS_DENIED`: Post không thuộc user

**Backend Module:** `server/src/controllers/post.controller.js`

**Note:** Soft delete (set deleted_at)

**Test Cases:**
- ✅ Xóa post của mình
- ❌ Xóa post của user khác

---

### 7.4. Lấy Logs của Post

**Endpoint:** `GET /api/v1/posts/:id/logs`

**Mục đích:** Lấy logs chi tiết của 1 post

**Role:** Authenticated user (owner)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2026-05-25T14:55:00Z",
        "level": "info",
        "step": "start",
        "message": "Started creating post"
      },
      {
        "timestamp": "2026-05-25T14:55:30Z",
        "level": "info",
        "step": "upload_video_1",
        "message": "Uploading video 1 to Facebook..."
      },
      {
        "timestamp": "2026-05-25T14:56:00Z",
        "level": "info",
        "step": "upload_video_1",
        "message": "Video 1 uploaded successfully",
        "details": {
          "facebook_video_id": "fb_video_123"
        }
      },
      {
        "timestamp": "2026-05-25T14:57:00Z",
        "level": "error",
        "step": "upload_video_2",
        "message": "Failed to upload video 2",
        "details": {
          "error_code": "UPLOAD_TIMEOUT",
          "error_message": "Request timeout after 30s"
        }
      }
    ]
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `404 POST_NOT_FOUND`: Post không tồn tại
- `403 ACCESS_DENIED`: Post không thuộc user

**Backend Module:** `server/src/controllers/post.controller.js`

**Test Cases:**
- ✅ Get logs của post mình
- ❌ Get logs của post user khác

---

## 8. LOGGING APIs

### 8.1. Lấy Logs của User

**Endpoint:** `GET /api/v1/logs`

**Mục đích:** Lấy logs hoạt động của user hiện tại

**Role:** Authenticated user

**Query Parameters:**
```
?page=1
&limit=50
&level=error
&type=facebook_api
&date_from=2026-05-01
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "timestamp": "2026-05-25T15:00:00Z",
        "level": "error",
        "type": "facebook_api",
        "message": "Facebook API error: Token expired",
        "details": {
          "error_code": 190,
          "error_message": "Error validating access token"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 123,
      "total_pages": 3
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token

**Backend Module:** `server/src/controllers/log.controller.js`

**Note:** Chỉ trả về logs của user hiện tại

**Test Cases:**
- ✅ Get logs với filters
- ✅ Chỉ thấy logs của mình

---

## 9. ADMIN APIs

### 9.1. Dashboard Stats

**Endpoint:** `GET /api/v1/admin/dashboard/stats`

**Mục đích:** Lấy thống kê tổng quan hệ thống

**Role:** Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1234,
      "active": 1150,
      "inactive": 50,
      "banned": 34,
      "new_today": 12,
      "new_this_week": 78,
      "new_this_month": 234
    },
    "posts": {
      "total": 5678,
      "success": 5450,
      "failed": 228,
      "scheduled": 45,
      "today": 45,
      "this_week": 312,
      "this_month": 1234
    },
    "videos": {
      "total_uploaded": 11356,
      "total_size_gb": 145.6
    },
    "errors": {
      "total_today": 23,
      "token_expired": 12,
      "upload_failed": 8,
      "rate_limit": 3
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin

**Backend Module:** `server/src/controllers/admin.controller.js`

**Test Cases:**
- ✅ Admin get stats
- ❌ User get stats (denied)

---

### 9.2. Dashboard Activity

**Endpoint:** `GET /api/v1/admin/dashboard/activity`

**Mục đích:** Lấy hoạt động gần đây

**Role:** Admin, Super Admin

**Query Parameters:**
```
?limit=10
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "type": "user_login",
        "user_id": "uuid",
        "username": "user123",
        "timestamp": "2026-05-25T15:00:00Z",
        "ip": "192.168.1.1"
      },
      {
        "type": "post_created",
        "user_id": "uuid",
        "username": "user456",
        "post_id": "uuid",
        "timestamp": "2026-05-25T14:55:00Z"
      }
    ]
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin

**Backend Module:** `server/src/controllers/admin.controller.js`

---

### 9.3. Danh sách Users

**Endpoint:** `GET /api/v1/admin/users`

**Mục đích:** Lấy danh sách tất cả users

**Role:** Admin, Super Admin

**Query Parameters:**
```
?page=1
&limit=20
&status=active
&role=user
&search=user123
&sort=created_at:desc
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "user123",
        "email": "user@example.com",
        "full_name": "Nguyễn Văn A",
        "role": "user",
        "status": "active",
        "posts_count": 45,
        "last_login_at": "2026-05-25T14:30:00Z",
        "created_at": "2026-03-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 234,
      "total_pages": 12
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin

**Backend Module:** `server/src/controllers/admin.controller.js`

**Test Cases:**
- ✅ Admin get all users
- ✅ Filters hoạt động
- ✅ Search hoạt động
- ❌ User get all users (denied)

---

### 9.4. Chi tiết User

**Endpoint:** `GET /api/v1/admin/users/:id`

**Mục đích:** Lấy chi tiết 1 user

**Role:** Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "user",
      "status": "active",
      "email_verified": true,
      "last_login_at": "2026-05-25T14:30:00Z",
      "created_at": "2026-03-15T10:00:00Z"
    },
    "facebook_connection": {
      "connected": true,
      "facebook_name": "Nguyễn Văn A",
      "facebook_id": "1234567890",
      "token_masked": "EAA...••••••••••••••••••••",
      "token_expires_at": "2026-07-25T00:00:00Z",
      "pages_count": 3,
      "ad_accounts_count": 2
    },
    "statistics": {
      "total_posts": 45,
      "successful_posts": 42,
      "failed_posts": 3,
      "scheduled_posts": 5,
      "total_videos_uploaded": 90,
      "total_storage_used_mb": 1250
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin
- `404 USER_NOT_FOUND`: User không tồn tại

**Backend Module:** `server/src/controllers/admin.controller.js`

**Security:** Token chỉ hiển thị masked, không hiển thị đầy đủ

**Test Cases:**
- ✅ Admin get user detail
- ✅ Token được mask
- ❌ User get detail của user khác (denied)

---

### 9.5. Ban User

**Endpoint:** `PUT /api/v1/admin/users/:id/ban`

**Mục đích:** Khóa tài khoản user

**Role:** Admin, Super Admin

**Request Body:**
```json
{
  "reason": "Spam, vi phạm điều khoản"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "status": "banned",
      "banned_at": "2026-05-25T15:10:00Z",
      "ban_reason": "Spam, vi phạm điều khoản"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin
- `404 USER_NOT_FOUND`: User không tồn tại
- `400 ALREADY_BANNED`: User đã bị ban

**Backend Module:** `server/src/controllers/admin.controller.js`

**Side Effects:**
- Revoke tất cả sessions của user
- Log vào admin_logs
- Gửi email thông báo (optional)

**Test Cases:**
- ✅ Admin ban user
- ✅ Sessions bị revoke
- ✅ Admin log được tạo
- ❌ User ban user khác (denied)

---

### 9.6. Unban User

**Endpoint:** `PUT /api/v1/admin/users/:id/unban`

**Mục đích:** Mở khóa tài khoản user

**Role:** Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "status": "active",
      "unbanned_at": "2026-05-25T15:15:00Z"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin
- `404 USER_NOT_FOUND`: User không tồn tại
- `400 NOT_BANNED`: User không bị ban

**Backend Module:** `server/src/controllers/admin.controller.js`

**Test Cases:**
- ✅ Admin unban user
- ✅ Admin log được tạo

---

### 9.7. Delete User

**Endpoint:** `DELETE /api/v1/admin/users/:id`

**Mục đích:** Xóa user (soft delete)

**Role:** Super Admin only

**Response Success (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 SUPER_ADMIN_REQUIRED`: Không phải super admin
- `404 USER_NOT_FOUND`: User không tồn tại

**Backend Module:** `server/src/controllers/admin.controller.js`

**Side Effects:**
- Soft delete user (set deleted_at)
- Cascade soft delete posts
- Cleanup uploaded files
- Log vào admin_logs

**Test Cases:**
- ✅ Super admin delete user
- ✅ Data được cleanup
- ❌ Admin delete user (denied)

---

### 9.8. Danh sách Posts (Admin)

**Endpoint:** `GET /api/v1/admin/posts`

**Mục đích:** Lấy danh sách tất cả posts (của tất cả users)

**Role:** Admin, Super Admin

**Query Parameters:**
```
?page=1
&limit=20
&user_id=uuid
&status=failed
&page_id=123456
&date_from=2026-05-01
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "username": "user123",
        "page_id": "123456",
        "page_name": "My Fanpage",
        "message": "Nội dung...",
        "status": "posted",
        "posted_at": "2026-05-25T15:00:00Z",
        "created_at": "2026-05-25T14:55:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5678,
      "total_pages": 284
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin

**Backend Module:** `server/src/controllers/admin.controller.js`

**Test Cases:**
- ✅ Admin get all posts
- ✅ Filters hoạt động
- ❌ User get all posts (denied)

---

### 9.9. System Logs

**Endpoint:** `GET /api/v1/admin/logs`

**Mục đích:** Lấy system logs

**Role:** Admin, Super Admin

**Query Parameters:**
```
?page=1
&limit=50
&level=error
&type=facebook_api
&user_id=uuid
&date_from=2026-05-01
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "timestamp": "2026-05-25T15:00:00Z",
        "level": "error",
        "user_id": "uuid",
        "username": "user123",
        "type": "facebook_api",
        "message": "Facebook API error: Token expired",
        "details": {
          "error_code": 190,
          "error_message": "Error validating access token"
        },
        "ip_address": "192.168.1.1"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 12345,
      "total_pages": 247
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin

**Backend Module:** `server/src/controllers/admin.controller.js`

**Test Cases:**
- ✅ Admin get system logs
- ✅ Filters hoạt động
- ❌ User get system logs (denied)

---

### 9.10. Top Errors

**Endpoint:** `GET /api/v1/admin/logs/top-errors`

**Mục đích:** Lấy top errors trong khoảng thời gian

**Role:** Admin, Super Admin

**Query Parameters:**
```
?period=24h
&limit=10
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "errors": [
      {
        "error_type": "token_expired",
        "count": 45,
        "last_occurrence": "2026-05-25T15:00:00Z",
        "affected_users": 23
      },
      {
        "error_type": "upload_timeout",
        "count": 23,
        "last_occurrence": "2026-05-25T14:55:00Z",
        "affected_users": 18
      }
    ]
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 ADMIN_REQUIRED`: Không phải admin

**Backend Module:** `server/src/controllers/admin.controller.js`

---

### 9.11. Get Settings

**Endpoint:** `GET /api/v1/admin/settings`

**Mục đích:** Lấy app settings

**Role:** Super Admin only

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "general": {
        "site_name": "Thích Cừu",
        "site_url": "https://thichcuu.com",
        "admin_email": "admin@thichcuu.com",
        "timezone": "Asia/Ho_Chi_Minh"
      },
      "security": {
        "rate_limit_enabled": true,
        "rate_limit_max_requests": 100,
        "rate_limit_window_minutes": 60,
        "session_timeout_hours": 24
      },
      "upload": {
        "max_file_size_mb": 500,
        "allowed_formats": ["mp4", "mov", "avi"],
        "max_video_duration_seconds": 300,
        "auto_cleanup_hours": 24
      },
      "facebook": {
        "graph_api_version": "v21.0",
        "retry_attempts": 3,
        "request_timeout_ms": 30000
      }
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 SUPER_ADMIN_REQUIRED`: Không phải super admin

**Backend Module:** `server/src/controllers/admin.controller.js`

**Test Cases:**
- ✅ Super admin get settings
- ❌ Admin get settings (denied)
- ❌ User get settings (denied)

---

### 9.12. Update Settings

**Endpoint:** `PUT /api/v1/admin/settings`

**Mục đích:** Cập nhật app settings

**Role:** Super Admin only

**Request Body:**
```json
{
  "key": "upload.max_file_size_mb",
  "value": 600
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "setting": {
      "key": "upload.max_file_size_mb",
      "value": 600,
      "updated_at": "2026-05-25T15:20:00Z",
      "updated_by": "admin_username"
    }
  }
}
```

**Error Cases:**
- `401 AUTH_REQUIRED`: Không có token
- `403 SUPER_ADMIN_REQUIRED`: Không phải super admin
- `400 INVALID_SETTING_KEY`: Key không hợp lệ
- `400 INVALID_SETTING_VALUE`: Value không hợp lệ

**Backend Module:** `server/src/controllers/admin.controller.js`

**Side Effects:**
- Log vào admin_logs
- Một số settings cần restart server

**Test Cases:**
- ✅ Super admin update settings
- ✅ Admin log được tạo
- ❌ Admin update settings (denied)
- ❌ Update với key invalid

---

## 9B. ADMIN PLAN MANAGEMENT APIS (NEW)

### API 48: GET /api/v1/admin/plans

**Mô tả:** Admin xem danh sách tất cả plans

**Method:** GET

**Authentication:** Required (JWT)

**Authorization:** Admin, Super Admin

**Request Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (number, optional): Trang (default: 1)
- `limit` (number, optional): Số items/trang (default: 20)
- `is_active` (boolean, optional): Filter theo status

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid",
        "name": "free",
        "display_name": "Free Plan",
        "description": "Basic features",
        "price": 0,
        "currency": "VND",
        "is_active": true,
        "is_default": true,
        "users_count": 150,
        "features_count": 9,
        "created_at": "2026-05-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2
    }
  }
}
```

---

### API 49: POST /api/v1/admin/plans

**Mô tả:** Admin tạo plan mới

**Method:** POST

**Authentication:** Required (JWT)

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "name": "enterprise",
  "display_name": "Enterprise Plan",
  "description": "For large teams",
  "price": 499000,
  "currency": "VND",
  "duration_days": 365
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "uuid",
      "name": "enterprise",
      "display_name": "Enterprise Plan",
      "created_at": "2026-05-25T15:00:00Z"
    }
  }
}
```

---

### API 50: GET /api/v1/admin/plans/:id/features

**Mô tả:** Admin xem features của 1 plan

**Method:** GET

**Authentication:** Required (JWT)

**Authorization:** Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "uuid",
      "name": "free"
    },
    "features": [
      {
        "feature_key": "can_edit_card_1",
        "feature_value": "true",
        "description": "Can edit card 1"
      },
      {
        "feature_key": "can_edit_card_2",
        "feature_value": "false",
        "description": "Cannot edit card 2"
      },
      {
        "feature_key": "monthly_post_limit",
        "feature_value": "5",
        "description": "Max 5 posts per month"
      }
    ]
  }
}
```

---

### API 51: PATCH /api/v1/admin/plans/:id/features

**Mô tả:** Admin cập nhật features của plan

**Method:** PATCH

**Authentication:** Required (JWT)

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "features": {
    "can_edit_card_2": "true",
    "monthly_post_limit": "10"
  }
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "updated_features": 2,
    "message": "Plan features updated successfully"
  }
}
```

**Side Effects:**
- Áp dụng ngay cho tất cả users của plan
- Log vào admin_logs

---

### API 52: PATCH /api/v1/admin/users/:id/plan

**Mô tả:** Admin gán plan cho user

**Method:** PATCH

**Authentication:** Required (JWT)

**Authorization:** Admin, Super Admin

**Request Body:**
```json
{
  "plan_id": "uuid",
  "expires_at": "2027-05-25T00:00:00Z"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user_plan": {
      "user_id": "uuid",
      "plan_id": "uuid",
      "plan_name": "premium",
      "status": "active",
      "started_at": "2026-05-25T15:00:00Z",
      "expires_at": "2027-05-25T00:00:00Z"
    }
  }
}
```

**Side Effects:**
- Expire plan cũ của user
- Tạo user_plan mới
- Log vào admin_logs

---

### API 53: POST /api/v1/admin/users/:id/feature-overrides

**Mô tả:** Admin override quyền cho user cụ thể

**Method:** POST

**Authentication:** Required (JWT)

**Authorization:** Admin, Super Admin

**Request Body:**
```json
{
  "feature_key": "can_edit_card_2",
  "feature_value": "true",
  "reason": "Special request from customer",
  "expires_at": "2027-01-01T00:00:00Z"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "override": {
      "id": "uuid",
      "user_id": "uuid",
      "feature_key": "can_edit_card_2",
      "feature_value": "true",
      "reason": "Special request",
      "overridden_by": "admin_id",
      "expires_at": "2027-01-01T00:00:00Z"
    }
  }
}
```

**Side Effects:**
- Override có priority cao hơn plan features
- Log vào admin_logs

---

### API 54: GET /api/v1/admin/users/:id/feature-overrides

**Mô tả:** Admin xem feature overrides của user

**Method:** GET

**Authentication:** Required (JWT)

**Authorization:** Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "overrides": [
      {
        "id": "uuid",
        "feature_key": "can_edit_card_2",
        "feature_value": "true",
        "reason": "Special request",
        "overridden_by": "admin_username",
        "created_at": "2026-05-25T10:00:00Z",
        "expires_at": "2027-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### API 55: DELETE /api/v1/admin/users/:id/feature-overrides/:override_id

**Mô tả:** Admin xóa feature override (user quay về quyền mặc định của plan)

**Method:** DELETE

**Authentication:** Required (JWT)

**Authorization:** Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "message": "Feature override removed successfully"
  }
}
```

**Side Effects:**
- User quay về quyền mặc định của plan
- Log vào admin_logs

---

## 9C. ADMIN CARD SETTINGS APIS (NEW)

### API 56: GET /api/v1/admin/card-settings

**Mô tả:** Admin xem cấu hình card 1 và card 2

**Method:** GET

**Authentication:** Required (JWT)

**Authorization:** Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "card_settings": [
      {
        "card_index": 0,
        "is_enabled": true,
        "is_locked_for_free": false,
        "is_locked_for_premium": false,
        "allowed_media_types": ["image", "video"],
        "max_file_size_mb": 500
      },
      {
        "card_index": 1,
        "is_enabled": true,
        "is_locked_for_free": true,
        "is_locked_for_premium": false,
        "default_media_url": "https://cdn.example.com/default-video.mp4",
        "default_title": "Default Card 2 Title",
        "default_link_url": "https://example.com",
        "allowed_media_types": ["image", "video"],
        "max_file_size_mb": 500
      }
    ]
  }
}
```

---

### API 57: PATCH /api/v1/admin/card-settings/card-2

**Mô tả:** Admin cập nhật cấu hình card 2

**Method:** PATCH

**Authentication:** Required (JWT)

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "is_locked_for_free": true,
  "is_locked_for_premium": false,
  "default_title": "Upgrade to Premium",
  "default_description": "Unlock more features",
  "default_link_url": "https://example.com/pricing"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "card_setting": {
      "card_index": 1,
      "is_locked_for_free": true,
      "default_title": "Upgrade to Premium",
      "updated_at": "2026-05-25T15:00:00Z"
    }
  }
}
```

**Side Effects:**
- Áp dụng ngay cho tất cả users
- Log vào admin_logs

---

### API 58: POST /api/v1/admin/card-settings/card-2/default-media

**Mô tả:** Admin upload media mặc định cho card 2

**Method:** POST

**Authentication:** Required (JWT)

**Authorization:** Super Admin only

**Request:** multipart/form-data
- `media` (file): Image hoặc video file

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "media": {
      "type": "video",
      "url": "https://cdn.example.com/card2-default.mp4",
      "thumbnail_url": "https://cdn.example.com/card2-thumb.jpg",
      "size_bytes": 5242880,
      "duration_seconds": 30
    }
  }
}
```

**Validation:**
- File type: image/video only
- Max size: 500MB
- Video duration: ≤5 min

**Side Effects:**
- Xóa media cũ (nếu có)
- Generate thumbnail
- Update card_settings table
- Log vào admin_logs

---

## 9D. USER PERMISSION APIS (NEW)

### API 59: GET /api/v1/me/plan

**Mô tả:** User xem plan hiện tại của mình

**Method:** GET

**Authentication:** Required (JWT)

**Authorization:** User, Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "uuid",
      "name": "free",
      "display_name": "Free Plan",
      "description": "Basic features",
      "price": 0,
      "status": "active",
      "started_at": "2026-05-20T10:00:00Z",
      "expires_at": null
    }
  }
}
```

---

### API 60: GET /api/v1/me/permissions

**Mô tả:** User xem danh sách quyền của mình (plan features + overrides)

**Method:** GET

**Authentication:** Required (JWT)

**Authorization:** User, Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "permissions": {
      "can_edit_card_1": true,
      "can_edit_card_2": false,
      "can_upload_image": true,
      "can_upload_video": true,
      "can_schedule_post": false,
      "can_retry_failed_post": false,
      "daily_post_limit": 2,
      "monthly_post_limit": 5,
      "max_upload_size_mb": 100
    },
    "overrides": [
      {
        "feature_key": "can_edit_card_2",
        "feature_value": true,
        "reason": "Special request",
        "expires_at": "2027-01-01T00:00:00Z"
      }
    ]
  }
}
```

**Business Logic:**
- Priority: override > plan feature > default false
- Nếu có override cho feature X, dùng override value
- Nếu không có override, dùng plan feature value

---

### API 61: GET /api/v1/me/card-settings

**Mô tả:** User xem cấu hình card 1 và card 2 (theo plan của mình)

**Method:** GET

**Authentication:** Required (JWT)

**Authorization:** User, Admin, Super Admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "card_settings": [
      {
        "card_index": 0,
        "is_enabled": true,
        "is_locked": false,
        "can_edit": true
      },
      {
        "card_index": 1,
        "is_enabled": true,
        "is_locked": true,
        "can_edit": false,
        "default_media_url": "https://cdn.example.com/default.mp4",
        "default_thumbnail_url": "https://cdn.example.com/thumb.jpg",
        "default_title": "Upgrade to Premium",
        "default_description": "Unlock more features",
        "default_link_url": "https://example.com/pricing"
      }
    ]
  }
}
```

**Business Logic:**
- `is_locked` phụ thuộc vào plan của user
- Free user: card 2 locked
- Premium user: card 2 unlocked (nếu permission cho phép)

---

## 10. PERMISSION MATRIX

| Endpoint | User | Admin | Super Admin | Ownership Check |
|----------|------|-------|-------------|-----------------|
| **Auth APIs** |
| POST /auth/register | ✅ | ✅ | ✅ | - |
| POST /auth/login | ✅ | ✅ | ✅ | - |
| POST /auth/logout | ✅ | ✅ | ✅ | - |
| GET /auth/me | ✅ | ✅ | ✅ | - |
| POST /auth/refresh | ✅ | ✅ | ✅ | - |
| PUT /auth/password | ✅ | ✅ | ✅ | Self only |
| POST /auth/forgot-password | ✅ | ✅ | ✅ | - |
| POST /auth/reset-password | ✅ | ✅ | ✅ | - |
| **User APIs** |
| GET /user/profile | ✅ | ✅ | ✅ | Self only |
| PUT /user/profile | ✅ | ✅ | ✅ | Self only |
| GET /user/settings | ✅ | ✅ | ✅ | Self only |
| PUT /user/settings | ✅ | ✅ | ✅ | Self only |
| **Facebook APIs** |
| POST /facebook/connect | ✅ | ❌ | ❌ | Self only |
| GET /facebook/status | ✅ | ❌ | ❌ | Self only |
| GET /facebook/pages | ✅ | ❌ | ❌ | Self only |
| GET /facebook/ad-accounts | ✅ | ❌ | ❌ | Self only |
| POST /facebook/refresh-token | ✅ | ❌ | ❌ | Self only |
| POST /facebook/disconnect | ✅ | ❌ | ❌ | Self only |
| **Video APIs** |
| POST /videos/upload | ✅ | ❌ | ❌ | Self only |
| GET /videos/:id | ✅ | ❌ | ❌ | Owner only |
| DELETE /videos/:id | ✅ | ❌ | ❌ | Owner only |
| **Post APIs** |
| POST /posts | ✅ | ❌ | ❌ | Self only |
| POST /posts/validate | ✅ | ❌ | ❌ | Self only |
| GET /posts | ✅ | ❌ | ❌ | Own posts only |
| GET /posts/:id | ✅ | ❌ | ❌ | Owner only |
| PUT /posts/:id | ✅ | ❌ | ❌ | Owner only |
| DELETE /posts/:id | ✅ | ❌ | ❌ | Owner only |
| POST /posts/:id/publish | ✅ | ❌ | ❌ | Owner only |
| POST /posts/:id/schedule | ✅ | ❌ | ❌ | Owner only |
| DELETE /posts/:id/schedule | ✅ | ❌ | ❌ | Owner only |
| POST /posts/:id/retry | ✅ | ❌ | ❌ | Owner only |
| GET /posts/:id/logs | ✅ | ❌ | ❌ | Owner only |
| **Log APIs** |
| GET /logs | ✅ | ❌ | ❌ | Own logs only |
| **Admin APIs** |
| GET /admin/dashboard/stats | ❌ | ✅ | ✅ | - |
| GET /admin/dashboard/activity | ❌ | ✅ | ✅ | - |
| GET /admin/users | ❌ | ✅ | ✅ | - |
| GET /admin/users/:id | ❌ | ✅ | ✅ | - |
| PUT /admin/users/:id/ban | ❌ | ✅ | ✅ | - |
| PUT /admin/users/:id/unban | ❌ | ✅ | ✅ | - |
| DELETE /admin/users/:id | ❌ | ❌ | ✅ | - |
| GET /admin/posts | ❌ | ✅ | ✅ | - |
| GET /admin/logs | ❌ | ✅ | ✅ | - |
| GET /admin/logs/top-errors | ❌ | ✅ | ✅ | - |
| GET /admin/settings | ❌ | ❌ | ✅ | - |
| PUT /admin/settings | ❌ | ❌ | ✅ | - |
| **Admin Plan APIs (NEW)** |
| GET /admin/plans | ❌ | ✅ | ✅ | - |
| POST /admin/plans | ❌ | ❌ | ✅ | - |
| GET /admin/plans/:id | ❌ | ✅ | ✅ | - |
| PATCH /admin/plans/:id | ❌ | ❌ | ✅ | - |
| GET /admin/plans/:id/features | ❌ | ✅ | ✅ | - |
| PATCH /admin/plans/:id/features | ❌ | ❌ | ✅ | - |
| PATCH /admin/users/:id/plan | ❌ | ✅ | ✅ | - |
| POST /admin/users/:id/feature-overrides | ❌ | ✅ | ✅ | - |
| GET /admin/users/:id/feature-overrides | ❌ | ✅ | ✅ | - |
| DELETE /admin/users/:id/feature-overrides/:override_id | ❌ | ✅ | ✅ | - |
| **Admin Card Settings APIs (NEW)** |
| GET /admin/card-settings | ❌ | ✅ | ✅ | - |
| PATCH /admin/card-settings/card-1 | ❌ | ❌ | ✅ | - |
| PATCH /admin/card-settings/card-2 | ❌ | ❌ | ✅ | - |
| POST /admin/card-settings/card-2/default-media | ❌ | ❌ | ✅ | - |
| DELETE /admin/card-settings/card-2/default-media | ❌ | ❌ | ✅ | - |
| **User Permission APIs (NEW)** |
| GET /me/plan | ✅ | ✅ | ✅ | Self only |
| GET /me/permissions | ✅ | ✅ | ✅ | Self only |
| GET /me/card-settings | ✅ | ✅ | ✅ | Self only |

**Notes:**
- ✅ = Có quyền truy cập
- ❌ = Không có quyền
- "Self only" = Chỉ truy cập dữ liệu của chính mình
- "Owner only" = Chỉ owner của resource mới truy cập được
- "Own posts only" = Chỉ thấy posts của mình, không thấy posts của user khác
- **(NEW)** = APIs mới cho plan system

---

## 11. API ERROR CODES

### 11.1. Authentication Errors (401)

| Code | Message | Description |
|------|---------|-------------|
| AUTH_REQUIRED | Authentication required | Không có token trong request |
| INVALID_TOKEN | Invalid token | Token không hợp lệ |
| TOKEN_EXPIRED | Token expired | Token đã hết hạn |
| INVALID_CREDENTIALS | Invalid credentials | Email/password sai |
| REFRESH_TOKEN_REQUIRED | Refresh token required | Không có refresh token |
| INVALID_REFRESH_TOKEN | Invalid refresh token | Refresh token không hợp lệ |
| REFRESH_TOKEN_EXPIRED | Refresh token expired | Refresh token hết hạn |

### 11.2. Authorization Errors (403)

| Code | Message | Description |
|------|---------|-------------|
| PERMISSION_DENIED | Permission denied | Không có quyền truy cập |
| ADMIN_REQUIRED | Admin access required | Cần quyền admin |
| SUPER_ADMIN_REQUIRED | Super admin access required | Cần quyền super admin |
| ACCESS_DENIED | Access denied | Không có quyền truy cập resource này |
| ACCOUNT_BANNED | Account has been banned | Tài khoản bị khóa |
| ACCOUNT_INACTIVE | Account is inactive | Tài khoản chưa active |
| EMAIL_NOT_VERIFIED | Email not verified | Email chưa verify |
| PLAN_LIMIT_EXCEEDED | Plan limit exceeded | Vượt giới hạn plan (NEW) |
| FEATURE_NOT_AVAILABLE | Feature not available in your plan | Tính năng không có trong plan (NEW) |
| CARD_LOCKED | Card is locked for your plan | Card bị khóa cho plan của bạn (NEW) |
| CANNOT_EDIT_CARD | Cannot edit this card | Không có quyền chỉnh card này (NEW) |

### 11.3. Validation Errors (400)

| Code | Message | Description |
|------|---------|-------------|
| VALIDATION_ERROR | Validation error | Dữ liệu không hợp lệ |
| WEAK_PASSWORD | Password is too weak | Password không đủ mạnh |
| PASSWORD_MISMATCH | Passwords do not match | Confirm password không khớp |
| INVALID_EMAIL | Invalid email format | Email không hợp lệ |
| INVALID_CURRENT_PASSWORD | Current password is incorrect | Password hiện tại sai |
| INVALID_SCHEDULE_TIME | Invalid schedule time | Thời gian lên lịch không hợp lệ |
| INVALID_STATUS | Invalid status | Status không hợp lệ |
| NOT_SCHEDULED | Post is not scheduled | Post không ở trạng thái scheduled |
| NOT_FAILED | Post is not failed | Post không ở trạng thái failed |
| MAX_RETRIES | Maximum retries exceeded | Đã retry quá nhiều lần |
| VIDEO_IN_USE | Video is in use | Video đang được dùng trong post |
| ALREADY_BANNED | User is already banned | User đã bị ban |
| NOT_BANNED | User is not banned | User không bị ban |

### 11.4. Resource Errors (404)

| Code | Message | Description |
|------|---------|-------------|
| USER_NOT_FOUND | User not found | User không tồn tại |
| POST_NOT_FOUND | Post not found | Post không tồn tại |
| VIDEO_NOT_FOUND | Video not found | Video không tồn tại |
| FB_NOT_CONNECTED | Facebook not connected | Chưa kết nối Facebook |
| PLAN_NOT_FOUND | Plan not found | Plan không tồn tại (NEW) |
| FEATURE_OVERRIDE_NOT_FOUND | Feature override not found | Override không tồn tại (NEW) |
| CARD_SETTING_NOT_FOUND | Card setting not found | Card setting không tồn tại (NEW) |

### 11.5. Conflict Errors (409)

| Code | Message | Description |
|------|---------|-------------|
| EMAIL_EXISTS | Email already exists | Email đã tồn tại |
| USERNAME_EXISTS | Username already exists | Username đã tồn tại |

### 11.6. Facebook Errors (400)

| Code | Message | Description |
|------|---------|-------------|
| INVALID_FB_TOKEN | Invalid Facebook token | Facebook token không hợp lệ |
| FB_TOKEN_EXPIRED | Facebook token expired | Facebook token hết hạn |
| FB_PERMISSION_MISSING | Facebook permission missing | Thiếu permissions |
| FB_REFRESH_FAILED | Failed to refresh token | Không thể refresh token |
| FACEBOOK_API_ERROR | Facebook API error | Lỗi từ Facebook API |

### 11.7. Upload Errors (400)

| Code | Message | Description |
|------|---------|-------------|
| NO_FILE | No file provided | Không có file trong request |
| INVALID_FILE_TYPE | Invalid file type | File type không hợp lệ |
| FILE_TOO_LARGE | File too large | File quá lớn |
| VIDEO_TOO_LONG | Video too long | Video quá dài |
| INVALID_VIDEO | Invalid video file | File không phải video hợp lệ |

### 11.8. Rate Limit Errors (429)

| Code | Message | Description |
|------|---------|-------------|
| RATE_LIMITED | Rate limit exceeded | Quá nhiều requests |
| TOO_MANY_ATTEMPTS | Too many attempts | Quá nhiều lần thử |
| TOO_MANY_REQUESTS | Too many requests | Quá nhiều requests |

### 11.9. Server Errors (500)

| Code | Message | Description |
|------|---------|-------------|
| INTERNAL_ERROR | Internal server error | Lỗi server |
| DATABASE_ERROR | Database error | Lỗi database |
| UPLOAD_FAILED | Upload failed | Upload thất bại |
| POST_FAILED | Post failed | Đăng bài thất bại |

---

## 12. API TEST PLAN

### 12.1. Auth APIs Testing

**Test Suite: Authentication**

**Happy Path:**
- ✅ Register với data hợp lệ → 201 Created
- ✅ Login với credentials đúng → 200 OK, tokens returned
- ✅ Get /auth/me với token hợp lệ → 200 OK, user info returned
- ✅ Refresh token với refresh token hợp lệ → 200 OK, new tokens
- ✅ Logout với token hợp lệ → 200 OK
- ✅ Change password với current password đúng → 200 OK
- ✅ Forgot password với email tồn tại → 200 OK, email sent
- ✅ Reset password với token hợp lệ → 200 OK

**Error Cases:**
- ❌ Register với email đã tồn tại → 409 EMAIL_EXISTS
- ❌ Register với username đã tồn tại → 409 USERNAME_EXISTS
- ❌ Register với password yếu → 400 WEAK_PASSWORD
- ❌ Login với password sai → 401 INVALID_CREDENTIALS
- ❌ Login với account banned → 403 ACCOUNT_BANNED
- ❌ Get /auth/me không có token → 401 AUTH_REQUIRED
- ❌ Get /auth/me với token expired → 401 TOKEN_EXPIRED
- ❌ Refresh với token expired → 401 REFRESH_TOKEN_EXPIRED
- ❌ Change password với current password sai → 401 INVALID_CURRENT_PASSWORD

**Security Tests:**
- 🔒 Password được hash trong DB (bcrypt)
- 🔒 Token không được log
- 🔒 Rate limit login (5 attempts/15 min)
- 🔒 Rate limit forgot password (3 requests/15 min)
- 🔒 Sessions bị revoke sau logout
- 🔒 Tất cả sessions bị revoke sau change password

---

### 12.2. User APIs Testing

**Test Suite: User Management**

**Happy Path:**
- ✅ Get profile → 200 OK
- ✅ Update profile (full_name, avatar) → 200 OK
- ✅ Get settings → 200 OK
- ✅ Update settings → 200 OK

**Error Cases:**
- ❌ Get profile không có auth → 401 AUTH_REQUIRED
- ❌ Update email (should be rejected) → 400 VALIDATION_ERROR
- ❌ Update role (should be rejected) → 400 VALIDATION_ERROR

**Ownership Tests:**
- ✅ User chỉ get/update profile của mình
- ❌ User không thể get profile của user khác

---

### 12.3. Facebook APIs Testing

**Test Suite: Facebook Connection**

**Happy Path:**
- ✅ Connect với token hợp lệ → 200 OK
- ✅ Get status khi đã connect → 200 OK, connected: true
- ✅ Get pages → 200 OK, pages array
- ✅ Get ad accounts → 200 OK, ad_accounts array
- ✅ Refresh token → 200 OK
- ✅ Disconnect → 200 OK

**Error Cases:**
- ❌ Connect với token invalid → 400 INVALID_FB_TOKEN
- ❌ Connect với token thiếu permissions → 403 FB_PERMISSION_MISSING
- ❌ Get pages khi chưa connect → 404 FB_NOT_CONNECTED
- ❌ Get pages với token expired → 401 FB_TOKEN_EXPIRED

**Security Tests:**
- 🔒 Token được encrypt trong DB (AES-256-GCM)
- 🔒 Token không được log thô
- 🔒 Admin không thấy token đầy đủ (chỉ masked)
- 🔒 User A không thể access Facebook data của user B

**Integration Tests:**
- 🔗 Test với Facebook Graph API thật
- 🔗 Test OAuth flow end-to-end
- 🔗 Test token refresh flow

---

### 12.4. Video APIs Testing

**Test Suite: Video Upload**

**Happy Path:**
- ✅ Upload video hợp lệ (MP4, <500MB, <5min) → 201 Created
- ✅ Thumbnail được generate
- ✅ Video metadata được extract (duration, resolution)
- ✅ Get video info → 200 OK
- ✅ Delete video → 200 OK

**Error Cases:**
- ❌ Upload không có file → 400 NO_FILE
- ❌ Upload file không phải video → 400 INVALID_FILE_TYPE
- ❌ Upload file quá lớn (>500MB) → 400 FILE_TOO_LARGE
- ❌ Upload video quá dài (>5min) → 400 VIDEO_TOO_LONG
- ❌ Upload file corrupt → 400 INVALID_VIDEO
- ❌ Delete video đang được dùng → 400 VIDEO_IN_USE

**Security Tests:**
- 🔒 Validate MIME type + extension
- 🔒 Validate file size
- 🔒 Validate video duration (ffmpeg)
- 🔒 User A không thể delete video của user B
- 🔒 Rate limit: 50 uploads/hour

**Performance Tests:**
- ⚡ Upload 10MB video < 5s
- ⚡ Upload 100MB video < 30s
- ⚡ Upload 500MB video < 2min
- ⚡ Thumbnail generation < 3s

---

### 12.5. Post APIs Testing

**Test Suite: Create & Publish Post**

**Happy Path:**
- ✅ Create draft post → 201 Created
- ✅ Validate post → 200 OK, valid: true
- ✅ Publish post → 200 OK, status: processing
- ✅ Schedule post → 200 OK, status: scheduled
- ✅ Cancel schedule → 200 OK, status: draft
- ✅ Retry failed post → 200 OK, status: processing

**Error Cases:**
- ❌ Create post chưa connect Facebook → 404 FB_NOT_CONNECTED
- ❌ Create post với video không tồn tại → 404 VIDEO_NOT_FOUND
- ❌ Create post với video của user khác → 403 VIDEO_ACCESS_DENIED
- ❌ Publish post của user khác → 403 ACCESS_DENIED
- ❌ Schedule với thời gian quá khứ → 400 INVALID_SCHEDULE_TIME
- ❌ Retry post đã success → 400 NOT_FAILED
- ❌ Retry quá 3 lần → 400 MAX_RETRIES

**Integration Tests:**
- 🔗 Test publish lên Facebook thật
- 🔗 Test upload video lên Facebook
- 🔗 Test create ad creative
- 🔗 Test poll effective_object_story_id
- 🔗 Test scheduled post job

**Ownership Tests:**
- ✅ User chỉ thấy posts của mình
- ❌ User không thể publish post của user khác
- ❌ User không thể delete post của user khác

**Rate Limit Tests:**
- 🔒 Max 20 posts/hour per user
- 🔒 Max 100 API requests/hour per user

---

### 12.6. Post History APIs Testing

**Test Suite: Post History**

**Happy Path:**
- ✅ Get posts với filters → 200 OK
- ✅ Get posts với pagination → 200 OK
- ✅ Get post detail → 200 OK
- ✅ Get post logs → 200 OK
- ✅ Delete post → 200 OK

**Filter Tests:**
- ✅ Filter by status (posted, scheduled, failed)
- ✅ Filter by page_id
- ✅ Filter by date range
- ✅ Search by message content
- ✅ Sort by created_at, posted_at

**Ownership Tests:**
- ✅ User chỉ thấy posts của mình trong list
- ❌ User không thể get detail post của user khác
- ❌ User không thể get logs của post user khác

**Performance Tests:**
- ⚡ Get posts list (20 items) < 200ms
- ⚡ Get post detail với logs < 300ms
- ⚡ Pagination hoạt động với 1000+ posts

---

### 12.7. Admin APIs Testing

**Test Suite: Admin Dashboard**

**Happy Path:**
- ✅ Get dashboard stats → 200 OK
- ✅ Get dashboard activity → 200 OK
- ✅ Get users list → 200 OK
- ✅ Get user detail → 200 OK
- ✅ Ban user → 200 OK
- ✅ Unban user → 200 OK
- ✅ Get all posts → 200 OK
- ✅ Get system logs → 200 OK
- ✅ Get top errors → 200 OK

**Permission Tests:**
- ❌ User get admin endpoints → 403 ADMIN_REQUIRED
- ✅ Admin get admin endpoints → 200 OK
- ✅ Super admin get admin endpoints → 200 OK

**Super Admin Only Tests:**
- ❌ Admin delete user → 403 SUPER_ADMIN_REQUIRED
- ❌ Admin get settings → 403 SUPER_ADMIN_REQUIRED
- ❌ Admin update settings → 403 SUPER_ADMIN_REQUIRED
- ✅ Super admin delete user → 200 OK
- ✅ Super admin get settings → 200 OK
- ✅ Super admin update settings → 200 OK

**Security Tests:**
- 🔒 Admin không thấy Facebook token thô (chỉ masked)
- 🔒 Admin actions được log vào admin_logs
- 🔒 Ban user → revoke tất cả sessions
- 🔒 Delete user → soft delete + cleanup files

**Performance Tests:**
- ⚡ Dashboard stats < 500ms
- ⚡ Users list (20 items) < 300ms
- ⚡ System logs (50 items) < 400ms
- ⚡ Performance tốt với 10,000+ users

---

### 12.8. End-to-End Test Scenarios

**Scenario 1: New User Journey**
```
1. POST /auth/register → 201 Created
2. GET /auth/verify-email?token=xxx → 200 OK
3. POST /auth/login → 200 OK, tokens
4. GET /auth/me → 200 OK, user info
5. POST /facebook/connect → 200 OK
6. GET /facebook/pages → 200 OK, pages
7. GET /facebook/ad-accounts → 200 OK, accounts
8. POST /videos/upload → 201 Created (video 1)
9. POST /videos/upload → 201 Created (video 2)
10. POST /posts → 201 Created (draft)
11. POST /posts/validate → 200 OK, valid: true
12. POST /posts/:id/publish → 200 OK, processing
13. [Wait for background job]
14. GET /posts/:id → 200 OK, status: posted
15. GET /posts → 200 OK, posts list
```

**Scenario 2: Admin Managing Users**
```
1. POST /auth/login (admin) → 200 OK
2. GET /admin/dashboard/stats → 200 OK
3. GET /admin/users?search=user123 → 200 OK
4. GET /admin/users/:id → 200 OK, user detail
5. PUT /admin/users/:id/ban → 200 OK
6. [User tries to login] → 403 ACCOUNT_BANNED
7. PUT /admin/users/:id/unban → 200 OK
8. [User can login again] → 200 OK
```

**Scenario 3: Scheduled Post**
```
1. POST /posts → 201 Created (draft)
2. POST /posts/:id/schedule → 200 OK, scheduled
3. [Wait until scheduled time]
4. [Cron job runs]
5. GET /posts/:id → 200 OK, status: posted
```

**Scenario 4: Failed Post Retry**
```
1. POST /posts/:id/publish → 200 OK, processing
2. [Facebook API fails]
3. GET /posts/:id → 200 OK, status: failed
4. GET /posts/:id/logs → 200 OK, error logs
5. POST /posts/:id/retry → 200 OK, processing
6. [Retry succeeds]
7. GET /posts/:id → 200 OK, status: posted
```

---

### 12.9. Load Testing

**Concurrent Users:**
- 10 concurrent users creating posts
- 50 concurrent users browsing posts
- 100 concurrent users uploading videos

**API Performance Targets:**
- GET endpoints: < 200ms (p95)
- POST endpoints: < 500ms (p95)
- Upload endpoints: < 5s for 10MB file
- Database queries: < 100ms (p95)

**Stress Testing:**
- 1000 requests/second
- 10,000 concurrent connections
- Database with 100,000+ posts

---

### 12.10. Security Testing

**Authentication Tests:**
- 🔒 JWT tampering detection
- 🔒 Token expiration enforcement
- 🔒 Refresh token rotation
- 🔒 Session hijacking prevention

**Authorization Tests:**
- 🔒 User A cannot access user B's data
- 🔒 User cannot access admin endpoints
- 🔒 Admin cannot access super admin endpoints
- 🔒 Ownership checks on all resources

**Input Validation:**
- 🔒 SQL injection attempts
- 🔒 XSS attempts
- 🔒 Path traversal attempts
- 🔒 File upload exploits

**Rate Limiting:**
- 🔒 Login rate limit (5/15min)
- 🔒 API rate limit (100/hour)
- 🔒 Upload rate limit (50/hour)
- 🔒 Post creation rate limit (20/hour)

**Data Protection:**
- 🔒 Facebook tokens encrypted in DB
- 🔒 Passwords hashed with bcrypt
- 🔒 Sensitive data not in logs
- 🔒 HTTPS only in production

---

## 13. API IMPLEMENTATION NOTES

### 13.1. Cần xác minh từ source hiện tại

**⚠️ QUAN TRỌNG:** Source hiện tại là tool local, chưa có backend API thật.

Các API trong document này là **ĐỀ XUẤT** dựa trên:
- Phân tích chức năng từ source cũ
- Best practices cho web application
- Yêu cầu multi-user và admin panel

**Cần xác minh:**
1. Source hiện tại có backend không?
2. Nếu có, backend dùng tech stack gì?
3. Có API endpoints nào đã tồn tại?
4. Authentication mechanism hiện tại?
5. Database schema hiện tại?

**Nếu source chưa có backend:**
- Tất cả APIs trong document này cần implement từ đầu
- Follow architecture plan trong Phase 2-17
- Implement theo đúng spec trong document này

### 13.2. Backend Module Mapping

**Dự kiến structure:**
```
server/src/
├── routes/
│   ├── auth.routes.js          → Auth APIs
│   ├── user.routes.js          → User APIs
│   ├── facebook.routes.js      → Facebook APIs
│   ├── video.routes.js         → Video APIs
│   ├── post.routes.js          → Post APIs
│   ├── log.routes.js           → Log APIs
│   └── admin.routes.js         → Admin APIs
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── facebook.controller.js
│   ├── video.controller.js
│   ├── post.controller.js
│   ├── log.controller.js
│   └── admin.controller.js
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── facebook.service.js
│   ├── video.service.js
│   ├── post.service.js
│   ├── encryption.service.js
│   └── email.service.js
├── repositories/
│   ├── user.repository.js
│   ├── post.repository.js
│   ├── video.repository.js
│   └── log.repository.js
└── middleware/
    ├── auth.js
    ├── rbac.js
    ├── ownership.js
    ├── rateLimit.js
    └── validator.js
```

### 13.3. API Documentation

**Sau khi implement, cần:**
1. Generate Swagger/OpenAPI documentation
2. Setup API documentation UI (Swagger UI)
3. Provide Postman collection
4. Write API integration guide

**Tools:**
- Swagger/OpenAPI 3.0
- Postman
- API Blueprint (optional)

---

## KẾT LUẬN

Document API Plan đã hoàn thành với đầy đủ:

✅ **Phần 1:** Tổng quan API (base URL, versioning, auth, response format)  
✅ **Phần 2:** Auth APIs (9 endpoints)  
✅ **Phần 3:** User APIs (4 endpoints)  
✅ **Phần 4:** Facebook APIs (7 endpoints)  
✅ **Phần 5:** Video APIs (4 endpoints)  
✅ **Phần 6:** Post APIs (6 endpoints)  
✅ **Phần 7:** Post History APIs (4 endpoints)  
✅ **Phần 8:** Log APIs (1 endpoint)  
✅ **Phần 9:** Admin APIs (12 endpoints)  
✅ **Phần 10:** Permission Matrix  
✅ **Phần 11:** API Error Codes  
✅ **Phần 12:** API Test Plan  
✅ **Phần 13:** Implementation Notes  

**Tổng số APIs:** 47 endpoints

**Bước tiếp theo:**
- Cập nhật các docs liên quan để reference API plan này
- Implement APIs theo từng phase trong implementation plan

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-25  
**Author:** Kiro AI Assistant
