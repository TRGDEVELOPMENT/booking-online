
## เป้าหมาย

ให้ผู้ใช้สร้างสี 1 ครั้ง แล้วเลือกได้ว่าจะใช้กับรุ่นไหนบ้าง (หลายรุ่น/หลาย sub model หรือทุกรุ่น) — โดย**ไม่แก้ schema** ระบบจะสร้างหลายแถวในตาราง `colors` ให้อัตโนมัติเบื้องหลัง

## พฤติกรรมใหม่ของหน้า ตั้งค่าสี (`/settings/colors`)

### ฟอร์มเพิ่ม/แก้ไขสี

ฟิลด์หลัก (master ของสี):
- ชื่อสี (description)
- รหัสสี / hex (free text + swatch)
- สถานะ (Radio: Active / Inactive)

ส่วน **"ใช้กับรุ่น"** (ใหม่):
- Toggle: ☐ **ใช้กับทุกรุ่น (Global)** — เมื่อติ๊กจะซ่อนรายการรุ่นด้านล่าง
- ถ้าไม่ติ๊ก → แสดง list แบบ multi-row:
  - แต่ละแถว: เลือก Model (dropdown) + Sub Model (dropdown มีตัวเลือก "— ทุก Sub Model —")
  - ปุ่ม **+ เพิ่มการใช้งาน** เพื่อเพิ่มรุ่นอื่น
  - ปุ่มถังขยะลบทีละแถว
  - ต้องมีอย่างน้อย 1 แถว

### ตรรกะการบันทึก (เบื้องหลัง)

- **โหมดสร้างใหม่**: ขยาย mapping เป็นแถวจริงในตาราง `colors`
  - Global → 1 แถว: `model_id = NULL, sub_model_id = NULL`
  - แต่ละ Model + Sub Model = 1 แถว
  - Model + "ทุก Sub Model" → ดึง sub_models ทั้งหมดของ model นั้น แล้ว insert 1 แถวต่อ sub
- **โหมดแก้ไข**: ใช้กลุ่ม master (ดูหัวข้อถัดไป) — diff mapping เก่า/ใหม่ แล้ว insert/update/delete แถวที่เกี่ยวข้องในชุดเดียวกัน
- ทุกแถวในกลุ่มเดียวกันใช้ description + hex + status ชุดเดียวกัน (sync อัตโนมัติเมื่อแก้)

### การ "จัดกลุ่ม" สีที่เป็น master เดียวกัน

ใช้คีย์ตรรกะ: `(company_id, description, hex_color)` = 1 สี master  
(ผู้ใช้ไม่ต้องรู้เรื่อง id ของแถว — มองเห็นเป็น 1 สี)

### ตารางหลัก (List view)

เปลี่ยนจาก list แบบ 1 แถว/รุ่น เป็น **group view**:

| No | ชื่อสี | Hex | ใช้กับ | สถานะ | จัดการ |
|----|--------|-----|--------|-------|--------|
| 1 | ขาวมุก | #F5F5F0 | Badge "ทุกรุ่น" | Active | ✏️ 🗑 |
| 2 | ดำเมทัลลิก | #1A1A1A | Badge "5 รุ่น" (hover เห็น list) | Active | ✏️ 🗑 |

- คลิก ✏️ → เปิด dialog พร้อม mapping ปัจจุบันที่ดึงมาทุกแถวของกลุ่มนี้
- คลิก 🗑 → ลบทุกแถวในกลุ่ม (confirm "ลบสีนี้ออกจาก N รุ่น?")

ค้นหาตามชื่อสีหรือ hex (ค้นในระดับ master)

## ส่วนอื่นที่กระทบ

- **หน้าจองรถ** (`ReservationCreate` / `ReservationEdit`): ตรงเลือกสี — เพิ่มเงื่อนไข query รวมแถว global (`model_id IS NULL`) เข้ามาด้วย และ deduplicate ตาม description+hex ก่อนแสดงใน dropdown
- **CSV Export/Import**: คงรูปแบบเดิม (1 แถว/รุ่น) — ไม่แก้

## ไฟล์ที่แก้

- `src/pages/settings/ColorsPage.tsx` — ฟอร์มหลายรุ่น + group view + save logic (เป็นการแก้ใหญ่)
- `src/pages/ReservationCreate.tsx` + `src/pages/ReservationEdit.tsx` — query สี รวม global + dedupe
- Memory: อัปเดต `colors-model-mapping` และ `colors-ui-spec` ให้สะท้อนพฤติกรรมใหม่

## สิ่งที่ไม่ทำ

- ไม่แก้ database schema, ไม่แตะ trigger `set_color_no`, ไม่แก้ RLS
- ไม่แก้ฟอร์แมต CSV import/export
- ไม่ migrate ข้อมูลเก่า (ของเดิมยังใช้งานได้ ตารางจะเริ่มแสดงเป็น group ทันที)
