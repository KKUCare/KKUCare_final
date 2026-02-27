// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User'; // แก้ import ให้ตรงกับโครงสร้างจริงของคุณ
import bcrypt from 'bcryptjs';
import { createSession } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    await dbConnect();

    // 1. หา User จากอีเมล
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้งานนี้" }, { status: 401 });
    }

    // 2. ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    // ✅ 3. สร้าง Session โดยระบุ ROLE ลงไปด้วย (สำคัญมากสำหรับ RBAC)
    await createSession({ 
      userId: user._id.toString(), 
      name: user.name, 
      email: user.email, 
      role: user.role // <--- เพิ่มตรงนี้ครับ
    });

    // 4. ตรวจสอบสิทธิ์ (อัปเดตให้รองรับ Role ใหม่ๆ)
    const allowedRoles = [
      'user', 
      'admin', 
      'staff_electricity', 
      'staff_water', 
      'staff_it',
      'staff_cleaning',
      'staff_security',
      'staff_general'
    ];
    
    // ถ้า Role ของ User ไม่อยู่ในลิสต์ข้างบน จะเข้าไม่ได้
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "สิทธิ์การใช้งานไม่เพียงพอ" }, { status: 403 });
    }

    return NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: { name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" }, { status: 500 });
  }
}