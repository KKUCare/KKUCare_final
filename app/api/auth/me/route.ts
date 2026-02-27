// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { verifySession } from '../../../lib/auth'; // เช็ค path ให้ถูกกับโครงสร้างโฟลเดอร์ของคุณ

export async function GET() {
  try {
    // 1. ตรวจสอบ Session จาก Cookie
    const session = await verifySession();

    // 2. ถ้าไม่มี Session (ไม่ได้ Login)
    if (!session) {
      return NextResponse.json({ user: null });
    }

    // 3. ถ้ามี Session ส่งข้อมูลกลับไป (รวมถึง Role!)
    return NextResponse.json({
      user: {
        userId: session.userId,
        name: session.name,
        email: session.email,
        role: session.role // <--- หัวใจสำคัญ: ต้องส่ง role กลับไป
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}