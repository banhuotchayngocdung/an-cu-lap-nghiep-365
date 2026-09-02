-- Chỉ chạy nếu website báo lỗi RLS khi đọc bảng rooms.
alter table public.rooms enable row level security;
drop policy if exists "Public can view rooms" on public.rooms;
create policy "Public can view rooms" on public.rooms
for select to anon, authenticated using (true);
-- Không mở UPDATE công khai. Phần /admin sẽ được bảo vệ bằng Supabase Auth ở bước tiếp theo.