// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ✅ เพิ่ม Role ตามโครงสร้างที่เราคุยกัน
  role: {
    type: String,
    enum: [
      'user',               // ผู้ใช้ทั่วไป
      'admin',              // เห็นทุกอย่าง
      'staff_electricity',  // งานไฟฟ้า
      'staff_water',        // งานประปา
      'staff_it',           // งาน IT
      'staff_cleaning',     // งานความสะอาด/ภูมิทัศน์
      'staff_security',     // งานความปลอดภัย
      'staff_general'       // งานทั่วไป
    ],
    default: 'user' // สมัครใหม่เป็น user เสมอ
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);