-- ล้างข้อมูลสีทั้งหมด
TRUNCATE TABLE colors RESTART IDENTITY CASCADE;

-- เพิ่ม columns สำหรับเชื่อมโยง Model และ Sub Model
ALTER TABLE colors ADD COLUMN model_id uuid REFERENCES models(id) ON DELETE CASCADE;
ALTER TABLE colors ADD COLUMN sub_model_id uuid REFERENCES sub_models(id) ON DELETE CASCADE;

-- สร้าง Index เพื่อ performance
CREATE INDEX idx_colors_model ON colors(model_id);
CREATE INDEX idx_colors_sub_model ON colors(sub_model_id);

-- เพิ่ม Unique constraint ป้องกันสีซ้ำในรุ่นเดียวกัน
ALTER TABLE colors ADD CONSTRAINT unique_color_per_submodel 
  UNIQUE (company_id, model_id, sub_model_id, description);