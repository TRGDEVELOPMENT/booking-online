

# แผนปรับปรุงระบบ Generate เลขที่เอกสารแยกตามสาขา

## สถานการณ์ปัจจุบัน

ปัจจุบันเลขที่เอกสารใน `ReservationCreate.tsx` ถูก generate แบบ random (`Math.random()`) โดยใช้ prefix ตาม company เท่านั้น ไม่ได้แยกตามสาขา แม้ว่าใน `mockData.ts` จะมี mapping prefix ตามสาขาอยู่แล้ว (เช่น LAC มี `LRARS` สำหรับสาขารามอินทรา, `LSVRS` สำหรับสาขาสุขุมวิท)

## แผนการดำเนินงาน

### 1. สร้าง Database Function สำหรับ Generate เลขที่เอกสาร

สร้าง function `generate_document_number(p_company_id, p_branch_id)` บน database เพื่อ:
- Map prefix ตามบริษัทและสาขา (BPK → BPKRS, LAC สาขารามอินทรา → LRARS, LAC สาขาสุขุมวิท → LSVRS, ICCK สาขาหนองแขม → ICKRS, ICCK สาขากิ่งแก้ว → IKKRS, VPA → VPARS)
- หา running number ถัดไปจากตาราง `reservations` โดยแยกตาม **prefix + yymm** (ไม่ใช่แค่ company)
- Format: `{PREFIX}-{YYMM}{RUNNING_5_DIGITS}` เช่น `LRARS-260300001`

### 2. สร้างตาราง document_sequences (Optional แต่แนะนำ)

เพื่อป้องกัน race condition และให้ running number ถูกต้อง จะสร้างตาราง `document_sequences` สำหรับเก็บ running number ล่าสุดแยกตาม prefix + ปีเดือน:

```text
document_sequences
├── id (uuid, PK)
├── prefix (text) - เช่น BPKRS, LRARS
├── year_month (text) - เช่น 2603
├── last_number (integer) - running number ล่าสุด
├── unique(prefix, year_month)
```

Function จะ UPDATE + RETURNING เพื่อรับ running number ถัดไปแบบ atomic

### 3. อัปเดต ReservationCreate.tsx

- ลบ function `generateDocumentNumber()` ที่ใช้ random
- เรียก database function `generate_document_number` ผ่าน `supabase.rpc()` แทน โดยส่ง `company_id` และ `branch_id` เป็น parameter
- ใช้ค่าที่ได้กลับมาเป็น `document_number` ในการ insert

### 4. Prefix Mapping

```text
Company  | Branch          | Prefix
---------|-----------------|--------
BPK      | ทุกสาขา          | BPKRS
VPA      | ทุกสาขา          | VPARS
LAC      | br-LAC-01 รามอินทรา | LRARS
LAC      | br-LAC-02 สุขุมวิท   | LSVRS
ICCK     | br-ICCK-01 หนองแขม  | ICKRS
ICCK     | br-ICCK-02 กิ่งแก้ว   | IKKRS
```

### สรุปขั้นตอน

1. Migration: สร้างตาราง `document_sequences` + function `generate_document_number`
2. อัปเดต `ReservationCreate.tsx` ให้เรียก `supabase.rpc('generate_document_number', ...)` แทน random
3. อัปเดต `mockData.ts` ให้สอดคล้อง (ถ้าจำเป็น)

