# An Cư Lập Nghiệp 365 — source khôi phục

Đã dựng lại website dựa trên Supabase hiện tại:
- Project URL: https://xhmtbnxcwjckgeqqgnvj.supabase.co
- Bảng `rooms`
- Trạng thái: `trong`, `sap_trong`, `da_thue`, `ngung`
- Phòng mẫu: `KH-A01`
- Storage bucket: `room-images`

## Chạy thử
1. Cài Node.js.
2. `npm install`
3. Đổi `.env.example` thành `.env`.
4. Điền `VITE_SUPABASE_PUBLISHABLE_KEY` bằng publishable key của Supabase.
5. `npm run dev`

## GitHub → Vercel
Đưa toàn bộ thư mục lên một repository GitHub, rồi Import repository đó ở Vercel.
Build command: `npm run build`
Output: `dist`
Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Không đưa `service_role`/secret key vào frontend.

## RLS
Nếu danh sách phòng không hiện, chạy `supabase.sql` trong Supabase SQL Editor.
