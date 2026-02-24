import { Button } from '@/components/ui/button';
import { FileDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApiSpecPage = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Controls - hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
        </Button>
        <h1 className="text-lg font-bold flex-1">API Specification</h1>
        <Button onClick={handlePrint} size="sm">
          <FileDown className="w-4 h-4 mr-1" /> Export PDF
        </Button>
      </div>

      <div className="max-w-5xl mx-auto p-8 space-y-10 text-sm">
        {/* Cover */}
        <section className="text-center py-12 border-b">
          <h1 className="text-4xl font-bold mb-2">API Specification</h1>
          <p className="text-xl text-muted-foreground">ระบบจองรถยนต์ (Car Reservation System)</p>
          <p className="text-muted-foreground mt-4">Version 1.0 — กุมภาพันธ์ 2569</p>
        </section>

        {/* TOC */}
        <section>
          <h2 className="text-2xl font-bold mb-4">สารบัญ</h2>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Authentication</li>
            <li>Base URL & Headers</li>
            <li>Data Models</li>
            <li>API Endpoints — Reservations</li>
            <li>API Endpoints — Customers</li>
            <li>API Endpoints — Master Data</li>
            <li>API Endpoints — Reports</li>
            <li>API Endpoints — File Upload</li>
            <li>Workflow & Status Transitions</li>
            <li>Error Codes</li>
          </ol>
        </section>

        {/* 1. Authentication */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">1. Authentication</h2>
          <p>ระบบใช้ JWT-based authentication ผ่าน Lovable Cloud</p>
          
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <Endpoint method="POST" path="/auth/v1/token?grant_type=password" desc="Login" />
            <CodeBlock>{`// Request Body
{
  "email": "user@example.com",
  "password": "password123"
}

// Response 200
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "abc123...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}`}</CodeBlock>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-3">
            <Endpoint method="POST" path="/auth/v1/signup" desc="Register" />
            <CodeBlock>{`// Request Body
{
  "email": "user@example.com",
  "password": "password123",
  "data": {
    "full_name": "ชื่อ นามสกุล",
    "company_id": "BPK",
    "branch_id": "HQ",
    "role": "sale"
  }
}`}</CodeBlock>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="font-semibold">Authorization Header</p>
            <CodeBlock>{`Authorization: Bearer <access_token>`}</CodeBlock>
          </div>
        </section>

        {/* 2. Base URL */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">2. Base URL & Headers</h2>
          <CodeBlock>{`Base URL: https://<project-ref>.supabase.co/rest/v1

Required Headers:
  apikey: <anon_key>
  Authorization: Bearer <access_token>
  Content-Type: application/json
  Prefer: return=representation  // สำหรับ INSERT/UPDATE ให้ return ข้อมูลกลับ`}</CodeBlock>
        </section>

        {/* 3. Data Models */}
        <section className="space-y-6 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">3. Data Models</h2>

          <DataModel title="reservations" fields={[
            ['id', 'uuid', 'PK, auto-generated'],
            ['document_number', 'text', 'NOT NULL, เลขที่เอกสาร'],
            ['company_id', 'text', 'NOT NULL, รหัสบริษัท'],
            ['branch_id', 'text', 'nullable, รหัสสาขา'],
            ['status', 'text', "NOT NULL, default 'draft' — draft | final | cancelled"],
            ['customer_type', 'text', "NOT NULL, default 'individual' — individual | corporate"],
            ['customer_name', 'text', 'NOT NULL'],
            ['customer_id_card', 'text', 'nullable, เลขบัตรประชาชน'],
            ['customer_phone', 'text', 'nullable'],
            ['customer_email', 'text', 'nullable'],
            ['customer_address', 'text', 'nullable'],
            ['buyer_name', 'text', 'nullable, ชื่อผู้ซื้อ (ถ้าต่างจากผู้จอง)'],
            ['buyer_id_card', 'text', 'nullable'],
            ['buyer_phone', 'text', 'nullable'],
            ['buyer_address', 'text', 'nullable'],
            ['vehicle_type', 'text', 'nullable'],
            ['model', 'text', 'nullable'],
            ['submodel', 'text', 'nullable'],
            ['color', 'text', 'nullable'],
            ['fuel_type', 'text', 'nullable'],
            ['list_price', 'numeric', 'default 0'],
            ['discount', 'numeric', 'default 0'],
            ['net_price', 'numeric', 'default 0'],
            ['deposit_amount', 'numeric', 'default 0'],
            ['expected_delivery_date', 'date', 'nullable'],
            ['freebies', 'jsonb', "default '[]' — [{id, name, value}]"],
            ['accessories', 'jsonb', "default '[]' — [{id, name, value}]"],
            ['benefits', 'jsonb', "default '[]' — [{id, name, value}]"],
            ['confirmation_status', 'text', "default 'pending'"],
            ['confirmation_method', 'text', 'nullable — otp | link'],
            ['confirmation_otp', 'text', 'nullable'],
            ['confirmed_at', 'timestamptz', 'nullable'],
            ['review_status', 'text', "default 'pending'"],
            ['review_remark', 'text', 'nullable'],
            ['reviewed_by', 'uuid', 'nullable'],
            ['reviewed_at', 'timestamptz', 'nullable'],
            ['approval_status', 'text', "default 'pending'"],
            ['approval_remark', 'text', 'nullable'],
            ['approved_by', 'uuid', 'nullable'],
            ['approved_at', 'timestamptz', 'nullable'],
            ['created_by', 'uuid', 'nullable'],
            ['created_at', 'timestamptz', 'default now()'],
            ['updated_at', 'timestamptz', 'default now()'],
          ]} />

          <DataModel title="customers" fields={[
            ['id', 'uuid', 'PK'],
            ['no', 'integer', 'running number per company'],
            ['customer_id', 'text', 'NOT NULL, auto-generated (CUSRSYY######)'],
            ['company_id', 'text', 'NOT NULL'],
            ['customer_type', 'text', "default 'individual'"],
            ['surname_id', 'uuid', 'FK → surnames.id'],
            ['first_name', 'text', 'NOT NULL'],
            ['last_name', 'text', 'NOT NULL'],
            ['tax_id', 'text', 'NOT NULL'],
            ['telephone', 'text', 'nullable'],
            ['mobile_phone', 'text', 'nullable'],
            ['email', 'text', 'nullable'],
            ['address1', 'text', 'nullable'],
            ['address2', 'text', 'nullable'],
            ['district', 'text', 'nullable'],
            ['province', 'text', 'nullable'],
            ['postal_code', 'text', 'nullable'],
            ['status', 'text', "default 'active'"],
            ['created_at', 'timestamptz', 'default now()'],
            ['updated_at', 'timestamptz', 'default now()'],
          ]} />

          <DataModel title="profiles" fields={[
            ['id', 'uuid', 'PK'],
            ['user_id', 'uuid', 'NOT NULL, unique'],
            ['full_name', 'text', 'NOT NULL'],
            ['company_id', 'text', 'NOT NULL'],
            ['branch_id', 'text', 'nullable'],
            ['created_at', 'timestamptz', 'default now()'],
            ['updated_at', 'timestamptz', 'default now()'],
          ]} />

          <DataModel title="user_roles" fields={[
            ['id', 'uuid', 'PK'],
            ['user_id', 'uuid', 'NOT NULL'],
            ['role', 'app_role', 'NOT NULL — sale | cashier | sale_supervisor | sale_manager | it'],
          ]} />

          <DataModel title="models" fields={[
            ['id', 'uuid', 'PK'],
            ['no', 'integer', 'running number'],
            ['description', 'text', 'NOT NULL, ชื่อรุ่น'],
            ['company_id', 'text', 'NOT NULL'],
            ['status', 'text', "default 'active'"],
          ]} />

          <DataModel title="sub_models" fields={[
            ['id', 'uuid', 'PK'],
            ['no', 'integer', 'running number'],
            ['model_id', 'uuid', 'FK → models.id'],
            ['description', 'text', 'NOT NULL'],
            ['company_id', 'text', 'NOT NULL'],
            ['status', 'text', "default 'active'"],
          ]} />

          <DataModel title="colors" fields={[
            ['id', 'uuid', 'PK'],
            ['no', 'integer', 'running number'],
            ['description', 'text', 'NOT NULL'],
            ['hex_color', 'text', "default '#000000'"],
            ['model_id', 'uuid', 'FK → models.id, nullable'],
            ['sub_model_id', 'uuid', 'FK → sub_models.id, nullable'],
            ['company_id', 'text', 'NOT NULL'],
            ['status', 'text', "default 'active'"],
          ]} />

          <DataModel title="vehicle_types / engine_sizes / freebies / accessories / benefits" fields={[
            ['id', 'uuid', 'PK'],
            ['no', 'integer', 'running number'],
            ['description', 'text', 'NOT NULL'],
            ['price', 'numeric', 'default 0 (เฉพาะ freebies, accessories, benefits)'],
            ['company_id', 'text', 'NOT NULL'],
            ['status', 'text', "default 'active'"],
          ]} />

          <DataModel title="standard_prices" fields={[
            ['id', 'uuid', 'PK'],
            ['no', 'integer', 'running number'],
            ['model_id', 'uuid', 'FK → models.id'],
            ['sub_model_id', 'uuid', 'FK → sub_models.id'],
            ['price', 'numeric', 'default 0'],
            ['company_id', 'text', 'NOT NULL'],
            ['status', 'text', "default 'active'"],
          ]} />

          <DataModel title="surnames" fields={[
            ['id', 'uuid', 'PK'],
            ['no', 'integer', 'running number'],
            ['description', 'text', 'NOT NULL, เช่น นาย, นาง, นางสาว'],
            ['status', 'text', "default 'active'"],
          ]} />

          <DataModel title="reservation_attachments" fields={[
            ['id', 'uuid', 'PK'],
            ['reservation_id', 'uuid', 'FK → reservations.id'],
            ['company_id', 'text', 'NOT NULL'],
            ['file_name', 'text', 'NOT NULL'],
            ['file_path', 'text', 'NOT NULL'],
            ['file_type', 'text', 'NOT NULL'],
            ['file_size', 'integer', 'NOT NULL, bytes'],
            ['uploaded_by', 'uuid', 'nullable'],
            ['created_at', 'timestamptz', 'default now()'],
          ]} />
        </section>

        {/* 4. Reservations API */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">4. API Endpoints — Reservations</h2>

          <ApiEndpoint
            method="GET"
            path="/rest/v1/reservations"
            desc="รายการใบจองทั้งหมด (company-scoped via RLS)"
            query="?select=*&order=created_at.desc&limit=50&offset=0"
            filters={[
              'status=eq.draft',
              'customer_name=ilike.*keyword*',
              'document_number=eq.RSV-0001',
              'created_at=gte.2025-01-01',
            ]}
            response={`// 200 OK
[
  {
    "id": "uuid",
    "document_number": "RSV-BPK-2025-0001",
    "status": "draft",
    "customer_name": "สมชาย ใจดี",
    "model": "Civic",
    "net_price": 850000,
    "created_at": "2025-01-15T10:30:00Z",
    ...
  }
]`}
          />

          <ApiEndpoint
            method="GET"
            path="/rest/v1/reservations"
            desc="ดึงใบจองเดียว"
            query="?id=eq.<uuid>&select=*"
            response={`// 200 OK — single object in array`}
          />

          <ApiEndpoint
            method="POST"
            path="/rest/v1/reservations"
            desc="สร้างใบจองใหม่"
            body={`{
  "document_number": "RSV-BPK-2025-0002",
  "company_id": "BPK",
  "customer_type": "individual",
  "customer_name": "สมหญิง รักดี",
  "customer_id_card": "1234567890123",
  "customer_phone": "0812345678",
  "model": "Civic",
  "submodel": "RS",
  "color": "Crystal Black Pearl",
  "list_price": 900000,
  "discount": 50000,
  "net_price": 850000,
  "deposit_amount": 10000,
  "freebies": [{"id": 1, "name": "ฟิล์มกรองแสง", "value": 5000}],
  "accessories": [],
  "benefits": []
}`}
            response={`// 201 Created
{ "id": "new-uuid", "document_number": "RSV-BPK-2025-0002", ... }`}
          />

          <ApiEndpoint
            method="PATCH"
            path="/rest/v1/reservations"
            desc="แก้ไขใบจอง"
            query="?id=eq.<uuid>"
            body={`{
  "customer_name": "สมหญิง รักดี (แก้ไข)",
  "discount": 60000,
  "net_price": 840000
}`}
            response={`// 200 OK`}
          />

          <ApiEndpoint
            method="PATCH"
            path="/rest/v1/reservations"
            desc="ยืนยันใบจอง (Step 2)"
            query="?id=eq.<uuid>"
            body={`{
  "confirmation_status": "confirmed",
  "confirmation_method": "otp",
  "confirmed_at": "2025-01-16T14:00:00Z"
}`}
          />

          <ApiEndpoint
            method="PATCH"
            path="/rest/v1/reservations"
            desc="Review ใบจอง (Step 4)"
            query="?id=eq.<uuid>"
            body={`{
  "review_status": "approved",
  "review_remark": "ตรวจสอบเรียบร้อย",
  "reviewed_by": "<user_uuid>",
  "reviewed_at": "2025-01-17T09:00:00Z"
}`}
          />

          <ApiEndpoint
            method="PATCH"
            path="/rest/v1/reservations"
            desc="อนุมัติใบจอง (Step 5)"
            query="?id=eq.<uuid>"
            body={`{
  "approval_status": "approved",
  "approval_remark": "อนุมัติ",
  "approved_by": "<user_uuid>",
  "approved_at": "2025-01-17T10:00:00Z",
  "status": "final"
}`}
          />

          <ApiEndpoint
            method="PATCH"
            path="/rest/v1/reservations"
            desc="ยกเลิกใบจอง (Step 7)"
            query="?id=eq.<uuid>"
            body={`{
  "status": "cancelled"
}`}
          />

          <ApiEndpoint
            method="DELETE"
            path="/rest/v1/reservations"
            desc="ลบใบจอง (draft only)"
            query="?id=eq.<uuid>"
            response={`// 204 No Content`}
          />
        </section>

        {/* 5. Customers API */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">5. API Endpoints — Customers</h2>

          <ApiEndpoint method="GET" path="/rest/v1/customers" desc="รายการลูกค้า" query="?select=*,surnames(description)&order=no.desc" />
          <ApiEndpoint method="GET" path="/rest/v1/customers" desc="ค้นหาลูกค้า" query="?or=(first_name.ilike.*keyword*,last_name.ilike.*keyword*,tax_id.eq.keyword)" />
          <ApiEndpoint method="POST" path="/rest/v1/customers" desc="สร้างลูกค้าใหม่" body={`{
  "company_id": "BPK",
  "customer_type": "individual",
  "surname_id": "<uuid>",
  "first_name": "สมชาย",
  "last_name": "ใจดี",
  "tax_id": "1234567890123",
  "mobile_phone": "0812345678",
  "email": "somchai@email.com",
  "address1": "123 ถ.สุขุมวิท",
  "district": "วัฒนา",
  "province": "กรุงเทพมหานคร",
  "postal_code": "10110"
}
// Note: customer_id & no auto-generated by trigger`} />
          <ApiEndpoint method="PATCH" path="/rest/v1/customers" desc="แก้ไขลูกค้า" query="?id=eq.<uuid>" body={`{ "mobile_phone": "0899999999" }`} />
          <ApiEndpoint method="DELETE" path="/rest/v1/customers" desc="ลบลูกค้า" query="?id=eq.<uuid>" />
        </section>

        {/* 6. Master Data API */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">6. API Endpoints — Master Data</h2>
          <p className="text-muted-foreground">ตารางต่อไปนี้ใช้ CRUD pattern เดียวกัน แตกต่างเฉพาะ table name:</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Table</th>
                  <th className="border border-border p-2 text-left">Key Fields</th>
                  <th className="border border-border p-2 text-left">Company-scoped</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['models', 'no, description', 'Yes'],
                  ['sub_models', 'no, description, model_id (FK)', 'Yes'],
                  ['vehicle_types', 'no, description', 'Yes'],
                  ['colors', 'no, description, hex_color, model_id, sub_model_id', 'Yes'],
                  ['engine_sizes', 'no, description', 'Yes'],
                  ['freebies', 'no, description, price', 'Yes'],
                  ['accessories', 'no, description, price', 'Yes'],
                  ['benefits', 'no, description, price', 'Yes'],
                  ['standard_prices', 'no, model_id, sub_model_id, price', 'Yes'],
                  ['surnames', 'no, description', 'No (shared)'],
                ].map(([table, fields, scoped]) => (
                  <tr key={table}>
                    <td className="border border-border p-2 font-mono">{table}</td>
                    <td className="border border-border p-2">{fields}</td>
                    <td className="border border-border p-2">{scoped}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="font-semibold">CRUD Pattern (ตัวอย่าง: models)</p>
            <CodeBlock>{`GET    /rest/v1/models?select=*&order=no.asc
POST   /rest/v1/models  { "description": "Civic", "company_id": "BPK" }
PATCH  /rest/v1/models?id=eq.<uuid>  { "description": "Civic (Updated)" }
DELETE /rest/v1/models?id=eq.<uuid>`}</CodeBlock>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="font-semibold">Sub Models — ต้องระบุ model_id</p>
            <CodeBlock>{`GET  /rest/v1/sub_models?model_id=eq.<uuid>&select=*,models(description)
POST /rest/v1/sub_models  { "description": "RS", "model_id": "<uuid>", "company_id": "BPK" }`}</CodeBlock>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="font-semibold">Standard Prices — join model & sub_model</p>
            <CodeBlock>{`GET /rest/v1/standard_prices?select=*,models(description),sub_models(description)&order=no.asc`}</CodeBlock>
          </div>
        </section>

        {/* 7. Reports */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">7. API Endpoints — Reports</h2>

          <ApiEndpoint
            method="GET"
            path="/rest/v1/reservations"
            desc="รายงานประจำเดือน"
            query={`?select=*&created_at=gte.2025-01-01&created_at=lt.2025-02-01&order=created_at.desc`}
          />

          <ApiEndpoint
            method="GET"
            path="/rest/v1/reservations"
            desc="รอการอนุมัติ"
            query={`?select=*&approval_status=eq.pending&status=eq.draft&order=created_at.asc`}
          />

          <ApiEndpoint
            method="GET"
            path="/rest/v1/reservations"
            desc="ใบจองที่ยกเลิก"
            query={`?select=*&status=eq.cancelled&order=updated_at.desc`}
          />
        </section>

        {/* 8. File Upload */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">8. API Endpoints — File Upload</h2>

          <div className="bg-muted rounded-lg p-4 space-y-3">
            <Endpoint method="POST" path="/storage/v1/object/reservation-attachments/{path}" desc="อัปโหลดไฟล์" />
            <CodeBlock>{`// Upload file to storage bucket
const { data, error } = await supabase.storage
  .from('reservation-attachments')
  .upload(\`\${companyId}/\${reservationId}/\${fileName}\`, file);

// Then insert metadata
POST /rest/v1/reservation_attachments
{
  "reservation_id": "<uuid>",
  "company_id": "BPK",
  "file_name": "สำเนาบัตรประชาชน.pdf",
  "file_path": "BPK/reservation-uuid/filename.pdf",
  "file_type": "application/pdf",
  "file_size": 245000,
  "uploaded_by": "<user_uuid>"
}`}</CodeBlock>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-3">
            <Endpoint method="GET" path="/storage/v1/object/public/reservation-attachments/{path}" desc="ดาวน์โหลดไฟล์ (public bucket)" />
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-3">
            <Endpoint method="DELETE" path="/storage/v1/object/reservation-attachments/{path}" desc="ลบไฟล์" />
            <CodeBlock>{`// Also delete metadata
DELETE /rest/v1/reservation_attachments?id=eq.<uuid>`}</CodeBlock>
          </div>
        </section>

        {/* 9. Workflow */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">9. Workflow & Status Transitions</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2">Step</th>
                  <th className="border border-border p-2">ชื่อ</th>
                  <th className="border border-border p-2">Role</th>
                  <th className="border border-border p-2">Fields Updated</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1', 'สร้างสัญญาจอง', 'sale', 'status=draft, all fields'],
                  ['2', 'ยืนยันสัญญาจอง', 'sale', 'confirmation_status, confirmation_method, confirmed_at'],
                  ['3', 'ตรวจสอบการชำระเงิน', 'cashier', 'deposit_amount verified'],
                  ['4', 'ตรวจสอบรายละเอียด', 'sale_supervisor', 'review_status, review_remark, reviewed_by, reviewed_at'],
                  ['5', 'อนุมัติ', 'sale_manager', 'approval_status, approval_remark, approved_by, approved_at, status=final'],
                  ['6', 'พิมพ์/ลงนาม', 'sale', 'Print only — no DB update'],
                  ['7', 'ยกเลิก/บอกเลิก', 'sale_manager', 'status=cancelled'],
                ].map(([step, name, role, fields]) => (
                  <tr key={step}>
                    <td className="border border-border p-2 text-center">{step}</td>
                    <td className="border border-border p-2">{name}</td>
                    <td className="border border-border p-2 font-mono">{role}</td>
                    <td className="border border-border p-2 text-xs">{fields}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="font-semibold mb-2">Status Flow</p>
            <CodeBlock>{`draft ──→ final      (เมื่ออนุมัติ Step 5)
draft ──→ cancelled  (เมื่อยกเลิก Step 7)
final ──→ cancelled  (เมื่อบอกเลิก Step 7)`}</CodeBlock>
          </div>
        </section>

        {/* 10. Error Codes */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">10. Error Codes</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2">HTTP Code</th>
                  <th className="border border-border p-2">Meaning</th>
                  <th className="border border-border p-2">Example</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['200', 'Success', 'GET / PATCH สำเร็จ'],
                  ['201', 'Created', 'POST สำเร็จ'],
                  ['204', 'No Content', 'DELETE สำเร็จ'],
                  ['400', 'Bad Request', 'ข้อมูลไม่ถูกต้อง / missing required fields'],
                  ['401', 'Unauthorized', 'Token หมดอายุ หรือไม่มี'],
                  ['403', 'Forbidden', 'RLS policy ไม่อนุญาต (ต่าง company)'],
                  ['404', 'Not Found', 'ไม่พบข้อมูล'],
                  ['409', 'Conflict', 'Duplicate document_number'],
                  ['422', 'Unprocessable', 'Validation error'],
                  ['500', 'Server Error', 'Database error'],
                ].map(([code, meaning, example]) => (
                  <tr key={code}>
                    <td className="border border-border p-2 font-mono font-bold">{code}</td>
                    <td className="border border-border p-2">{meaning}</td>
                    <td className="border border-border p-2">{example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <p className="font-semibold mb-2">Error Response Format</p>
            <CodeBlock>{`{
  "code": "PGRST116",
  "details": null,
  "hint": null,
  "message": "The result contains 0 rows"
}`}</CodeBlock>
          </div>
        </section>

        {/* RLS Note */}
        <section className="space-y-4 break-before-page">
          <h2 className="text-2xl font-bold border-b pb-2">หมายเหตุสำคัญ — Row Level Security</h2>
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-destructive">⚠️ ทุก Table มี RLS Policies</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>ข้อมูลถูก filter ตาม <code className="bg-muted px-1 rounded">company_id</code> ของ user อัตโนมัติ</li>
              <li>ใช้ function <code className="bg-muted px-1 rounded">get_user_company_id(auth.uid())</code> ในการตรวจสอบ</li>
              <li>ต้อง login (มี JWT token) จึงจะเข้าถึงข้อมูลได้</li>
              <li>ไม่สามารถดูข้อมูลข้าม company ได้</li>
              <li><code className="bg-muted px-1 rounded">surnames</code> เป็นตารางเดียวที่ shared ทุก company</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-muted-foreground pt-8 border-t">
          <p>API Specification v1.0 — ระบบจองรถยนต์</p>
          <p>สร้างโดย Lovable AI</p>
        </footer>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .break-before-page { page-break-before: always; }
          body { font-size: 11px; }
        }
      `}</style>
    </div>
  );
};

// Helper Components
const Endpoint = ({ method, path, desc }: { method: string; path: string; desc: string }) => {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/20 text-emerald-700',
    POST: 'bg-blue-500/20 text-blue-700',
    PATCH: 'bg-amber-500/20 text-amber-700',
    DELETE: 'bg-red-500/20 text-red-700',
    PUT: 'bg-purple-500/20 text-purple-700',
  };
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[method] || ''}`}>{method}</span>
      <code className="text-xs">{path}</code>
      <span className="text-muted-foreground text-xs">— {desc}</span>
    </div>
  );
};

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-background rounded p-3 text-xs overflow-x-auto whitespace-pre-wrap border">
    <code>{children}</code>
  </pre>
);

const DataModel = ({ title, fields }: { title: string; fields: string[][] }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-bold font-mono">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border text-xs">
        <thead>
          <tr className="bg-muted">
            <th className="border border-border p-1.5 text-left">Column</th>
            <th className="border border-border p-1.5 text-left">Type</th>
            <th className="border border-border p-1.5 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {fields.map(([col, type, notes]) => (
            <tr key={col}>
              <td className="border border-border p-1.5 font-mono">{col}</td>
              <td className="border border-border p-1.5 font-mono text-muted-foreground">{type}</td>
              <td className="border border-border p-1.5">{notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ApiEndpoint = ({ method, path, desc, query, body, response, filters }: {
  method: string; path: string; desc: string; query?: string; body?: string; response?: string; filters?: string[];
}) => (
  <div className="bg-muted rounded-lg p-4 space-y-3">
    <Endpoint method={method} path={path} desc={desc} />
    {query && <CodeBlock>{`Query: ${path}${query}`}</CodeBlock>}
    {filters && (
      <div>
        <p className="text-xs font-semibold mb-1">Available Filters:</p>
        <CodeBlock>{filters.join('\n')}</CodeBlock>
      </div>
    )}
    {body && (
      <div>
        <p className="text-xs font-semibold mb-1">Request Body:</p>
        <CodeBlock>{body}</CodeBlock>
      </div>
    )}
    {response && (
      <div>
        <p className="text-xs font-semibold mb-1">Response:</p>
        <CodeBlock>{response}</CodeBlock>
      </div>
    )}
  </div>
);

export default ApiSpecPage;
