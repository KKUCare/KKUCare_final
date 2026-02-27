import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    await dbConnect();

    // 1. ตรวจสอบว่ามีอีเมลนี้หรือยัง
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // 2. เข้ารหัสรหัสผ่าน (Salt 12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. บันทึกข้อมูล
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดบางอย่าง" }, { status: 500 });
  }
}