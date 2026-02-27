import { NextResponse } from 'next/server';
import { deleteSession } from '../../../lib/auth';

export async function POST() {
  await deleteSession(); // ลบ Cookie ออก (รอให้การตั้งค่า cookie เสร็จก่อนตอบกลับ)
  return NextResponse.json({ success: true });
}