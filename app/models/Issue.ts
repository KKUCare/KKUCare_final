// models/Issue.ts
import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true, // ห้ามซ้ำ
  },
  reporter: {
    userId: String,    // เก็บ ID คนแจ้ง
    name: String,      // เก็บชื่อคนแจ้ง
    email: String,     // เก็บอีเมล
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['ทั่วไป', 'ไฟฟ้า/แสงสว่าง', 'ประปา', 'ไอที/เครือข่าย', 'ความปลอดภัย', 'ความสะอาด'],
  },
  location: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending', // เริ่มต้นเป็น "รอดำเนินการ"
  },
  image: {
    type: String, // เราจะเก็บเป็น Base64 string ชั่วคราว (หรือ URL ถ้ามี Cloud Storage)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Issue || mongoose.model('Issue', IssueSchema);