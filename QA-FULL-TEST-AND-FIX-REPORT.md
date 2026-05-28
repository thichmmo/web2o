# QA FULL TEST AND FIX REPORT

Ngay kiem tra: 2026-05-27  
Workspace: `C:\xampp\htdocs`  
Docs goc da doc: `.claude/docs/*.md`

## 1. Tong quan qua trinh test

Da chay full QA theo checklist Admin Panel, User Frontend va API/security. Qua trinh gom:

- Doc docs trong `.claude/docs`.
- Doc source backend, admin frontend, user frontend.
- Xac dinh command run/test/build.
- Seed demo data an toan.
- Test API bang Jest/Supertest.
- Test API smoke rong cho admin/user/Facebook/post/settings/card settings.
- Test UI smoke bang Playwright cho admin va user frontend.
- Sua cac loi phat hien va test lai.

## 2. Moi truong test

- OS/shell: Windows PowerShell.
- Backend: Express/Sequelize/MySQL.
- Database local: `thichcuu_fb_tool`.
- Backend API: `http://localhost:3001/api/v1`.
- User frontend: `http://localhost:5173`.
- Admin frontend: `http://localhost:5175`.
- Node/NPM workspace project.
- Dung `npm.cmd` tren PowerShell.

## 3. Lenh da chay

- `npm.cmd test --workspace=server -- --runInBand`
- `npm.cmd run build --workspace=admin`
- `npm.cmd run build --workspace=frontend`
- `npm.cmd run ensure:dev-schema --workspace=server`
- `npm.cmd run seed:demo --workspace=server`
- Supertest API smoke script cho admin/user/Facebook/post/settings/card settings.
- Playwright UI smoke script cho admin/user.
- Live API check:
  - `POST http://localhost:3001/api/v1/auth/login`
  - `GET http://localhost:3001/api/v1/admin/users`
  - `GET http://localhost:3001/api/v1/admin/users/:id`
  - `GET http://localhost:3001/api/v1/posts/:id`
- Restart live backend/admin dev server sau khi sua.

## 4. Chuc nang Admin da test

- Admin login bang email/password.
- Admin route chi admin vao duoc.
- User thuong bi chan khi vao admin UI va API.
- Dashboard stats: users, active/inactive/admin users, posts, status posts, Facebook accounts, recent activity logs.
- User list: search, role/status filter, pagination 20/page, khong leak password.
- User detail: thong tin user, plan/subscription/stats, Facebook accounts khong leak token.
- Admin xem email user trong list/detail va reset password user.
- User subscriptions/history endpoint.
- Feature override add/delete va anh huong Card 2 permission.
- Plans: list, subscriber count, create, update, toggle, delete temp plan, block delete subscribed plan, validate features JSON.
- Admin posts: list/detail co sanitized Facebook account, khong leak token.
- Activity logs: list/filter theo user/action/resource, pagination 50/page.
- Card settings: list, update Card 2, upload default media, lock Free user.
- System settings: email/SMTP/branding/custom CSS/JS save, SMTP password masked, custom JS size validation.

## 5. Chuc nang User da test

- Register user moi.
- Login/logout API flow.
- Validate password length/register/login basics.
- User dashboard: post stats, Facebook account count, plan/subscription.
- Facebook account dev mock connect/list/pages/groups/disconnect.
- Khong tra raw Facebook token ra frontend/API response.
- User chi thay Facebook accounts cua chinh minh.
- Create post voi Card 1 bat buoc.
- Upload image cho Card 1/Card 2.
- Caption, target profile, Facebook account.
- Draft/scheduled/publish-now API path duoc validate trong post controller/API smoke.
- Card 2:
  - Free user bi lock va backend ignore payload Card 2.
  - Free user dung admin default Card 2.
  - Premium user edit Card 2 khi permission bat.
  - Override user anh huong permission.
- Post list/filter/pagination.
- User A khong xem duoc post User B.
- Post detail khong leak token.
- Edit draft post.
- Retry failed post.
- Delete post.
- Subscription: current plan, plans list, mock upgrade, history.
- Profile: view/update name, change password, usage stats endpoint.

## 6. API/security da test

- Protected API khong auth bi chan.
- User goi admin API bi chan 403.
- Admin endpoints yeu cau role admin.
- Admin reset password user: user thuong bi chan, password moi login duoc, response khong leak password/hash.
- Invalid token bi chan.
- Inactive user bi chan.
- Password khong xuat hien trong response.
- Raw Facebook token/accessToken/dev_mock token khong xuat hien trong response.
- SMTP password duoc mask thanh `********`.
- Free user gui payload Card 2 bi backend ignore va apply admin defaults.
- Premium user Card 2 duoc backend quyet dinh theo plan/feature permission.
- User A truy cap post User B bi chan 404.
- File upload sai dinh dang bi chan.
- File upload qua dung luong branding bi chan.
- Rate limit tra 429 khi vuot nguong.
- CORS/helmet/rate-limit middleware khong lam hong app smoke flow.

## 7. Loi da tim thay

- Admin UI dang nhap bao sai pass do dev server admin dang chay env cu, goi `/api/auth/login` thay vi `/api/v1/auth/login`.
- `admin/.env.example` sai API base URL (`/api` thay vi `/api/v1`).
- `GET /api/v1/admin/users/:id` crash `ReferenceError: role is not defined`.
- Admin auth slice log login payload/JWT token ra console.
- Facebook service log raw error response, co rui ro log data nhay cam.
- Demo seed truoc do co the lam lech admin password; da chot lai `Admin@123456`.
- Backend thieu/loi nhieu surface can thiet cho QA: Card 2 permission backend, sanitized Facebook token, SMTP mask, upload middleware tach image/video, rate limit, mock Facebook/payment flow.
- MySQL search/admin filter co loi tu `Op.iLike` va query `isActive=` rong.
- Plans page/admin user detail co loi response shape.
- Facebook Page carousel publish bang Marketing API tao dark post: local bao `published` nhung Facebook story van `is_published=false`, `is_hidden=true`, nen user khong thay bai tren Page.
- UI chua hien permalink sau khi push thanh cong, nen kho xac minh bai that tren Facebook.

## 8. Loi da sua

- Sua `admin/.env.example` ve `http://localhost:3001/api/v1`.
- Restart admin dev server de nhan `admin/.env` dung; admin login UI da pass.
- Sua `adminController.getUser` crash va chuyen validation/self-admin guard ve `updateUser`.
- Them validation role/isActive khi admin update user.
- Them admin reset user password endpoint va UI modal trong User Detail.
- Go log JWT/login payload trong admin frontend.
- Sanitize log loi Facebook service.
- Them Jest/Supertest QA security tests.
- Them test upload qua dung luong va rate limit.
- Them/hoan thien dev seed demo an toan.
- Them mock Facebook connect va mock subscription upgrade.
- Sua backend Card 2 permission la source of truth.
- Sua response sanitization de khong leak Facebook token/password/SMTP password.
- Sua upload middleware cho branding/post/card default media.
- Sua admin/user frontend API base URL va cac UI/API response shape.
- Sua live Facebook Page publish: sau khi tao ad creative, backend poll `effective_object_story_id`, goi Page token de set `is_published=true`, verify `is_hidden=false`, lay `permalink_url`, luu vao `posts.fb_post_url` va tra ve API.
- Them hien thi link Facebook post trong user Post History, user Post Detail va admin Posts.

## 9. File da sua

Backend:

- `server/src/config/env.js`
- `server/src/app.js`
- `server/src/models/index.js`
- `server/src/models/FacebookAccount.js`
- `server/src/models/Post.js`
- `server/src/models/FacebookAdAccount.js`
- `server/src/migrations/20260527000008-add-post-facebook-url.js`
- `server/src/middleware/upload.js`
- `server/src/services/permissionService.js`
- `server/src/services/facebookService.js`
- `server/src/controllers/authController.js`
- `server/src/controllers/facebookController.js`
- `server/src/controllers/postController.js`
- `server/src/controllers/adminController.js`
- `server/src/controllers/planController.js`
- `server/src/controllers/cardSettingsController.js`
- `server/src/controllers/settingsController.js`
- `server/src/controllers/userController.js`
- `server/src/routes/authRoutes.js`
- `server/src/routes/facebookRoutes.js`
- `server/src/routes/postRoutes.js`
- `server/src/routes/adminRoutes.js`
- `server/src/routes/settingsRoutes.js`
- `server/src/routes/userRoutes.js`
- `server/scripts/ensure-dev-schema.js`
- `server/scripts/seed-demo.js`
- `server/tests/qa-security.test.js`
- `server/package.json`
- `server/.env.example`

Admin frontend:

- `admin/src/services/api.js`
- `admin/src/store/slices/authSlice.js`
- `admin/src/pages/CardSettings.jsx`
- `admin/src/pages/Settings.jsx`
- `admin/src/pages/ActivityLogs.jsx`
- `admin/src/pages/Posts.jsx`
- `admin/src/pages/Plans.jsx`
- `admin/src/pages/UserDetail.jsx`
- `admin/.env.example`

User frontend:

- `frontend/src/services/api.js`
- `frontend/src/store/slices/postSlice.js`
- `frontend/src/store/slices/facebookSlice.js`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/FacebookAccounts.jsx`
- `frontend/src/pages/CreatePost.jsx`
- `frontend/src/pages/PostHistory.jsx`
- `frontend/src/pages/PostDetail.jsx`
- `frontend/src/pages/Subscription.jsx`
- `frontend/src/pages/Profile.jsx`
- `frontend/src/layouts/DashboardLayout.jsx`
- `frontend/src/App.jsx`
- `frontend/.env.example`

Docs/report:

- `QA-FULL-TEST-AND-FIX-REPORT.md`
- `.claude/docs/07-testing-plan.md`
- `.claude/docs/HANDOVER.md`
- `HANDOVER.md`

## 10. Test da pass

- Jest/Supertest: `17 passed`.
- Admin build: pass.
- Frontend build: pass.
- Playwright UI smoke: admin/user pages pass; permalink smoke pass tren user post list, user post detail va admin posts.
- API smoke rong: pass cac nhom:
  - Admin dashboard stats.
  - Admin users list/filter/detail/stats/subscriptions.
  - Admin plan CRUD/validation/subscriber guard.
  - Admin card settings update/upload.
  - System settings update/masking/validation.
  - User auth/dashboard/subscription/profile.
  - Facebook mock connect/list/pages/groups/disconnect.
  - User post create/list/detail/update/retry/delete.
- Live admin reset password flow: pass voi user tam, da cleanup.
- Live admin login API: pass.
- Live admin user detail API: pass.

## 11. Test chua test duoc va ly do

- Facebook OAuth live: can cau hinh Facebook App credential, valid redirect URI va permissions de test OAuth connect moi. Page publish live da test bang token/Page/ad account that da ket noi; dev/mock flow van pass khi thieu credential.
- Payment live: chua co payment provider credential. Da test mock upgrade flow. Can cau hinh env/payment provider de test live.
- SMTP send email live: da test save/mask settings, chua gui email that vi chua co SMTP credential.
- Forgot password: chuc nang nay chua co route/page rieng trong source hien tai, nen khong test duoc end-to-end.
- Group publish live: mock groups pass; live can Facebook permission that.
- Custom JavaScript: da gioi han kich thuoc va luu duoc; day van la tinh nang co rui ro XSS neu admin nhap code doc hai. Can policy CSP/sandbox neu dung production.

## 12. Env/credential can cau hinh de test that

- `JWT_SECRET`: secret production manh.
- `ENCRYPTION_KEY`: key production manh neu ma hoa token.
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_GRAPH_VERSION`.
- Facebook OAuth redirect URI tren app Facebook.
- Facebook permissions cho profile/page/group/publish.
- SMTP: host, port, user, password, from name/address.
- Payment provider credential neu implement live payment.
- `CORS_ORIGIN` dung domain frontend/admin production.
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`.

## 13. Demo accounts

- Admin: `admin@thichcuu.com` / `Admin@123456`
- Free user: `free.user@example.test` / `Demo@123456`
- Premium user: `premium.user@example.test` / `Demo@123456`

Seed demo co:

- Plans: Free, Basic, Pro, Enterprise.
- Feature permissions mau.
- Card settings mau.
- Dev mock Facebook account cho tung demo user.

## 14. Rui ro con lai

- Live Facebook/payment/SMTP can credential that de verify production behavior.
- Custom JS la rui ro bao mat neu cho admin nhap script tuy y; hien da validate size va chi admin moi update duoc, nhung production nen can CSP/sandbox/chinh sach ro.
- UI E2E da smoke cac trang/flow chinh; chua tu dong click het moi nut destructive tren UI vi API smoke da cover destructive logic chinh.
- Repo khong co git metadata, nen khong tao duoc git diff/commit trong report.

## 15. Huong dan chay lai test

Tu `C:\xampp\htdocs`:

```powershell
npm.cmd test --workspace=server -- --runInBand
npm.cmd run build --workspace=admin
npm.cmd run build --workspace=frontend
```

Neu DB moi/chua co schema:

```powershell
npm.cmd run ensure:dev-schema --workspace=server
npm.cmd run seed:demo --workspace=server
```

## Update 2026-05-27 - Facebook page publish/ad account

- Da sua luong publish Page carousel: backend bat buoc chon Facebook Ad Account thuoc dung Facebook account cua user.
- Da them API `GET /api/v1/facebook/accounts/:accountId/ad-accounts` va UI dropdown Ad account tren User Create Post khi target la Page.
- Da sua upload path `/uploads/...` tren Windows de Facebook publish doc dung file trong `server/uploads/...`.
- Da sua leak `facebookAccount.accessToken` trong response publish/update post.
- Da test tai khoan `premium.user@example.test`, Facebook account `Đặng Văn Tiên`, Page `Admin set`, Ad account `act_2649242048811414`.
- Bai `d99fb39d-b784-4b48-9d70-63e037afb434` hien `published`, `fbPostId=372874445919974_122214297548538429`, `facebookCreativeId=1693991625065943`.
- Port `127.0.0.1:3000` dang bi app ngoai project `Kinx Auto.exe` chiem, nen dev backend/frontend/admin da chuyen sang API `http://localhost:3001/api/v1`.

## Update 2026-05-27 - Fix Facebook `Invalid parameter` voi video carousel

- Loi moi: post `ce134c1d-6caf-477b-8eee-26d6d4aab33f` caption `abc abc` fail: `Failed to publish carousel post: Invalid parameter`.
- Nguyen nhan 1: user chon ad account `act_1926240804700295` co `accountStatus=101`; backend/UI da cap nhat de chi cho dung ad account usable status `1`/`ACTIVE`.
- Nguyen nhan 2: Card 1 la video, Card 2 la image. Facebook Marketing API yeu cau video child attachment co `image_hash` thumbnail; service cu chi gui `video_id`.
- Da sua publish service: khi carousel co video, upload image card lam thumbnail va gan `image_hash` cho video child attachment; neu carousel toan video ma khong co image thumbnail thi backend tra loi ro rang thay vi loi Facebook chung chung.
- Da retry post `abc abc` thanh cong voi ad account `act_2649242048811414`.
- Ket qua: `status=published`, `fbPostId=372874445919974_122214303860538429`, `facebookCreativeId=1702768317628336`, `errorMessage=null`.
- Regression: `npm.cmd test --workspace=server -- --runInBand` -> 17/17 pass; frontend/admin build pass; UI smoke chi hien 1 ad account active.

## Update 2026-05-27 - Fix published thanh cong nhung chua hien tren Page

- Loi moi: local status bao `published` nhung user check Page chua thay bai.
- Nguyen nhan: Marketing API ad creative tao Page story dang hidden/unpublished (dark post). Chi luu `effective_object_story_id` la chua du de bai xuat hien cong khai tren Page.
- Da sua service publish: sau khi lay story ID, backend dung Page access token goi publish story, verify Graph fields `is_published=true`, `is_hidden=false`, va bat buoc co `permalink_url`.
- Da them cot/model `fbPostUrl` va migrate/schema dev `fb_post_url`.
- API publish tra ve `data.fbPostUrl`; user/admin UI hien link "Open Facebook post"/"Open post" khi bai co permalink.
- Da verify live Graph cho post `ce134c1d-6caf-477b-8eee-26d6d4aab33f`: `isPublished=true`, `isHidden=false`, permalink:
  `https://www.facebook.com/61566152891343/posts/pfbid02mjJ6DnvPt8pj8QuseLZor7Mn75Mmp5Ct1EV7ManoYP6bEe47bk2B2FSnVMHTqR4il`
- Playwright smoke da pass: user post list, user post detail va admin posts deu hien dung permalink tren.

## Update 2026-05-28 - Fix System Settings branding save/logo/favicon

- Loi moi: admin Settings upload logo/favicon luu DB nhung anh khong xem duoc do app dang chay `server/src/app.js` chua serve `/uploads`, preview URL admin ghep sai `http://localhost:3001/v1/uploads/...`, va Helmet CORP chan anh cross-origin tu port frontend/admin.
- Da sua backend serve public `/uploads` tu `server/uploads` va cau hinh `crossOriginResourcePolicy: cross-origin`.
- Da them `GET /api/v1/settings/public` chi tra branding an toan: site name/description/logo/favicon/colors/custom CSS; khong tra SMTP/password/secret.
- Da sua admin Settings preview logo/favicon dung origin API, hien loi upload/save ro rang, va refresh branding sau khi luu/upload.
- Da sua admin/user layout va login/register doc branding public de doi ten site, logo, favicon/document title that su.
- Regression: `npm.cmd test --workspace=server -- --runInBand` -> 18/18 pass; admin/frontend build pass; Playwright smoke doi ten/upload logo/load logo/admin header/user login pass.

## Update 2026-05-28 - Verify/fix Card Settings lock va allowed media

- Kiem tra cac switch `Khóa cho user Free`, `Khóa cho user Premium`, va `Loại media cho phép`.
- Phat hien Card 1 lock dang hien trong Admin UI nhung backend chua chan tao post cho Card 1. Da them backend guard `canUseCard` cho Card 1 theo `isEnabled/isLockedForFree/isLockedForPremium`.
- Card 2 lock cho Free/Premium da co backend check; da bo sung regression test rieng cho Premium lock.
- `allowedMediaTypes` da chan user upload sai loai media; da bo sung test cho Card 1 va Card 2.
- Upload default media trong Admin Card Settings nay cung bi backend validate theo allowed media/max size, khong chi dua vao frontend.
- User Create Post nhan them `cardAccess` tu API de disable Card 1 tren UI neu card bi lock/disable.
- Regression: `npm.cmd test --workspace=server -- --runInBand` -> 19/19 pass; admin/frontend build pass; live API smoke pass va da reset settings ve trang thai ban dau.

## Update 2026-05-29 - Add public Landing Page

- Them landing page public tai user frontend route `/`.
- Hero dung screenshot that cua app (`frontend/public/landing-dashboard.png`) lam visual background.
- Landing doc branding public de lay site name/logo/favicon/colors tu System Settings.
- Them public pricing API `GET /api/v1/public/plans`, chi tra active plans va khong can auth.
- Landing gom: hero/CTA, workflow 4 buoc, feature sections, pricing tu DB, FAQ, footer.
- Route `/dashboard` van protected; user chua login truy cap dashboard bi redirect `/login`.
- Regression: `npm.cmd test --workspace=server -- --runInBand` -> 20/20 pass; `npm.cmd run build --workspace=frontend` pass; Playwright smoke `/` pass, pricing/API/image asset pass.

## 16. Huong dan chay project va kiem tra thu cong

Chay tung terminal:

```powershell
npm.cmd run dev:server
npm.cmd run dev:frontend
npm.cmd run dev:admin
```

Mo:

- Backend health: `http://localhost:3001/health`
- User frontend: `http://localhost:5173`
- Admin frontend: `http://localhost:5175`

Neu PowerShell chan `npm`, dung `npm.cmd`.

Admin login hien da duoc verify:

- URL: `http://localhost:5175/login`
- Email: `admin@thichcuu.com`
- Password: `Admin@123456`
