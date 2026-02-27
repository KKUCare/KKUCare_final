import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './app/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // อ่านค่า Cookie session (ถ้ามี) และยืนยัน JWT ว่ายังถูกต้อง
  const session = request.cookies.get('session')?.value;
  const payload = await verifyToken(session);

  // 1. ถ้าไม่มี Session ที่ถูกต้อง แต่พยายามเข้าหน้า Report หรือ Status -> ดีดไป Login
  if (!payload && (path.startsWith('/report') || path.startsWith('/status'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. ถ้ามี Session แล้ว แต่พยายามเข้าหน้า Login/Register -> ดีดไปหน้า Home
  if (payload && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// กำหนด Path ที่จะให้ Middleware ทำงาน
export const config = {
  matcher: ['/report/:path*', '/status/:path*', '/login', '/register'],
};