# Handover - QA Full Test And Fix

Ngay cap nhat: 2026-05-27

## Trang thai hien tai

- Backend live: `http://localhost:3001/api/v1`
- User frontend: `http://localhost:5173`
- Admin frontend: `http://localhost:5175`
- Admin login da verify: `admin@thichcuu.com` / `Admin@123456`
- Free user: `free.user@example.test` / `Demo@123456`
- Premium user: `premium.user@example.test` / `Demo@123456`

## Da sua trong dot QA

- Sua admin frontend API env ve `/api/v1`, nguyen nhan gay loi dang nhap "sai pass".
- Sua crash admin user detail do `role` undefined trong `getUser`.
- Them backend validation khi admin update role/status user va chan admin tu ha quyen/tat chinh minh.
- Go console log JWT/login payload trong admin frontend.
- Sanitize Facebook service error logging.
- Hoan thien dev seed/schema, Card 2 permission, mock Facebook, mock subscription upgrade, token/password/SMTP masking.
- Them Jest/Supertest QA security tests.
- Cap nhat `.env.example` lien quan.
- Them Facebook Ad Account model/API/UI, bat buoc Page carousel publish chon ad account thuoc dung user/Facebook account.
- Sua publish response khong leak `facebookAccount.accessToken`.
- Sua resolver media `/uploads/...` tren Windows.
- Sua loi live Facebook `Invalid parameter` cho carousel co video card: them `image_hash` thumbnail vao video child attachment.
- Loc ad account theo status usable `1`/`ACTIVE`; status `101` khong con duoc chon/dung publish.
- Port `127.0.0.1:3000` dang bi app ngoai project `Kinx Auto.exe` chiem; local dev chuyen sang backend port `3001`.

## Verification da chay

- `npm.cmd test --workspace=server -- --runInBand` -> 17/17 pass.
- `npm.cmd run build --workspace=admin` -> pass.
- `npm.cmd run build --workspace=frontend` -> pass.
- Live smoke: `premium.user@example.test` + Facebook account `Đặng Văn Tiên` co 3 ad accounts, bai Page `Admin set` da publish `fbPostId=372874445919974_122214297548538429`.
- Live smoke bo sung: post `abc abc` co Card 1 video/Card 2 image da publish `fbPostId=372874445919974_122214303860538429`, `facebookCreativeId=1702768317628336`.
- Live Graph verify bo sung: post `abc abc` da duoc publish cong khai tren Page, `isPublished=true`, `isHidden=false`, permalink `https://www.facebook.com/61566152891343/posts/pfbid02mjJ6DnvPt8pj8QuseLZor7Mn75Mmp5Ct1EV7ManoYP6bEe47bk2B2FSnVMHTqR4il`.
- Da sua luong Page publish de khong con bao success gia: backend publish Page story bang Page token, verify public/khong hidden, luu `fbPostUrl`, va UI user/admin hien link bai Facebook.
- Playwright UI smoke -> 16/16 pass.
- Playwright permalink smoke -> user post list, user post detail va admin posts deu hien link Facebook post.
- Update 2026-05-28: Fix System Settings branding. Backend serves `/uploads`, Helmet allows cross-origin branding images, public branding endpoint added at `/api/v1/settings/public`, admin Settings preview URL fixed, and admin/user UI uses saved site name/logo/favicon. Regression now 18/18 backend tests plus admin/frontend build pass.
- Update 2026-05-28: Verify/fix Card Settings locks/media. Card 1 lock now enforced by backend, Card 2 Premium lock regression covered, allowed media types enforced for user uploads and admin default media uploads. Regression now 19/19 backend tests plus admin/frontend build pass; live API smoke pass.
- Update 2026-05-29: Added public landing page at `http://localhost:5173/`, with branding from `/api/v1/settings/public`, pricing from new `GET /api/v1/public/plans`, and real app screenshot asset `frontend/public/landing-dashboard.png`. Regression now 20/20 backend tests; frontend build and Playwright landing smoke pass.
- API smoke rong -> pass cho admin/users/plans/card/settings/user/Facebook/posts.
- Live API login va admin user detail -> pass.

## Can cau hinh de test live

- Facebook App ID/Secret, redirect URI va permissions that.
- SMTP credential that neu can test gui email.
- Payment provider credential neu chuyen mock upgrade sang live payment.
- Production `JWT_SECRET`, `ENCRYPTION_KEY`, `CORS_ORIGIN`.

## Lenh chay lai nhanh

```powershell
npm.cmd run ensure:dev-schema --workspace=server
npm.cmd run seed:demo --workspace=server
npm.cmd test --workspace=server -- --runInBand
npm.cmd run build --workspace=admin
npm.cmd run build --workspace=frontend
```

Chay app:

```powershell
npm.cmd run dev:server
npm.cmd run dev:frontend
npm.cmd run dev:admin
```

Report day du: `QA-FULL-TEST-AND-FIX-REPORT.md`.
