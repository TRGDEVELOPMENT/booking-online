---
name: IT Admin cross-company access
description: IT role bypasses RLS via additional policies and can log into any company; selected company at login becomes active context (synced to profiles.company_id).
type: feature
---
ผู้ใช้บทบาท `it` (IT Admin) มีสิทธิ์ข้ามขอบเขต Multi-tenancy:

- **RLS bypass**: ทุกตารางหลัก (profiles, user_roles, reservations, customers, branches, master data, sales_teams, ฯลฯ) มี policy เพิ่มเติม `USING (has_role(auth.uid(), 'it'))` ให้ IT ทำ CRUD ได้ทุกบริษัท
- **Login**: IT ข้ามการตรวจ `profile.company_id !== company`. ระบบจะ sync `profiles.company_id` เป็นบริษัทที่เลือกตอน login เพื่อใช้เป็น tenant context
- **Company Switcher**: เมื่อ IT เปลี่ยน company ใน sidebar/header, MainLayout จะ update `profiles.company_id` แล้ว `window.location.reload()` เพื่อรีเฟรชข้อมูล (Non-IT users ไม่มี side effect นี้ — ป้องกันการปนเปื้อนข้ามบริษัท)
- **UsersPage** (`/settings/users`): IT จะเห็น users ทุกบริษัท + มี "กรองตามบริษัท" dropdown + คอลัมน์ "บริษัท" (Badge) แสดงสังกัด
