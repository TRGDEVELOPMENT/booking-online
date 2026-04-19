

## Plan: Customer Confirmation View (Design Mockup)

Create a design-only mockup screen showing how customers will see the contract confirmation flow on their device — both OTP and Link methods. This is for internal **design review with users**, not the live customer flow.

### 1. New menu item (Sidebar)

Add under the **"ใบจองรถยนต์"** group (visible to `sale`, `sale_supervisor`, `sale_manager`, `it`, `user_admin`):

- **Label:** `ยืนยันสัญญาจอง (Customer View)`
- **Path:** `/reservations/customer-confirm-preview`
- **Icon:** `Smartphone` (lucide)

Treated as a "design preview" page — purely UI mockup, no DB calls.

### 2. New page: `src/pages/CustomerConfirmPreviewPage.tsx`

Layout: centered page with a header explaining purpose ("หน้านี้เป็นตัวอย่าง UI ฝั่งลูกค้า สำหรับ Confirm Design") + a **Tabs** component with 2 tabs:

**Tab 1 — กรณียืนยันด้วย OTP**
**Tab 2 — กรณียืนยันด้วย Link**

Each tab renders a **mobile-frame mockup** (max-w-sm, rounded-3xl border with shadow) so reviewers visualize the customer's phone screen.

### 3. Mockup contents — both share a common card

Top of card:
- Company logo + "ยืนยันสัญญาจองรถยนต์"
- Reservation summary (read-only): เลขที่ใบจอง, ชื่อผู้จอง, รุ่น/รุ่นย่อย/สี, ราคา, เงินจอง, วันที่ส่งมอบ
- Sales advisor contact (name + phone)

#### Tab 1 — OTP flow (3 sub-states shown stacked or as inner steps)
1. **State A: Request OTP** — "เราจะส่งรหัส OTP 6 หลักไปที่เบอร์ 08X-XXX-1234" + ปุ่ม `ขอรหัส OTP`
2. **State B: Enter OTP** — `InputOTP` 6 ช่อง, countdown "รหัสหมดอายุใน 04:32", link "ส่งรหัสใหม่อีกครั้ง", ปุ่ม `ยืนยันสัญญาจอง`
3. **State C: Success** — ไอคอน ✓ สีเขียว "ยืนยันสัญญาจองสำเร็จ" + timestamp + ปุ่ม "ดาวน์โหลดสำเนาใบจอง (PDF)"

Use a small inner Tabs/Stepper or stacked cards so reviewer sees all three states on one page.

#### Tab 2 — Link flow (3 sub-states)
1. **State A: Landing (after click email link)** — "สวัสดีคุณ {ชื่อ}, กรุณาตรวจสอบรายละเอียดสัญญาจองด้านล่าง", checkbox "ข้าพเจ้าได้อ่านและยอมรับเงื่อนไข", ปุ่ม `ยืนยันสัญญาจอง`
2. **State B: Link หมดอายุ** — ไอคอนเตือนสีเหลือง "ลิงก์นี้หมดอายุแล้ว กรุณาติดต่อที่ปรึกษาการขาย" + เบอร์ติดต่อ
3. **State C: Success** — เหมือน OTP success state

### 4. Styling notes

- Use existing tokens: `bg-card`, `border`, `text-foreground`, `text-muted-foreground`, primary buttons.
- Mobile frame: `mx-auto max-w-sm rounded-[2.5rem] border-8 border-slate-800 bg-background overflow-hidden` to simulate phone bezel.
- Status badges use workflow colors from memory (green `#02681f` for confirmed).
- Mock data hardcoded inside the page — no Supabase calls.

### 5. Routing

Add route in `src/App.tsx` inside `MainLayout`:
```
<Route path="/reservations/customer-confirm-preview" element={<CustomerConfirmPreviewPage />} />
```

### Files to change
- `src/components/layout/Sidebar.tsx` — add sub-item
- `src/pages/CustomerConfirmPreviewPage.tsx` — new page (mockup)
- `src/App.tsx` — register route

