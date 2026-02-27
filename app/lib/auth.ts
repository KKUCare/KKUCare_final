// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-it');

// 1. สร้าง Session
export async function createSession(payload: any) {
  // Ensure common ID fields are strings (avoid storing ObjectId/Buffer in token)
  const safePayload = { ...payload };
  if (safePayload.userId && typeof safePayload.userId !== 'string' && safePayload.userId.toString) {
    safePayload.userId = safePayload.userId.toString();
  }

  const token = await new SignJWT(safePayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // หมดอายุใน 1 วัน
    .sign(secretKey);

  const cookieStore = await cookies();
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

// 2. ตรวจสอบ Session
export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, secretKey);
    // Normalize common ID shapes to string (handles older tokens with ObjectId/Buffer)
    const p: any = payload;
    if (p.userId && typeof p.userId !== 'string') {
      // If it has a toString that returns a useful representation, use it
      try {
        const s = p.userId.toString();
        if (s && !s.startsWith('[object')) {
          p.userId = s;
        } else if ((p.userId as any)._bsontype && (p.userId as any).id) {
          p.userId = Buffer.from((p.userId as any).id).toString('hex');
        } else if ((p.userId as any).buffer) {
          const arr = Object.values((p.userId as any).buffer as any) as number[];
          p.userId = Buffer.from(arr).toString('hex');
        } else if (Array.isArray(p.userId)) {
          p.userId = Buffer.from(p.userId as any as number[]).toString('hex');
        } else {
          p.userId = String(p.userId);
        }
      } catch (err) {
        p.userId = String(p.userId);
      }
    }

    return p;
  } catch (err) {
    return null;
  }
}

// 4. ตรวจสอบ Token โดยตรง (ใช้ได้จาก Middleware ด้วยการส่ง token มาให้)
export async function verifyToken(token: string | undefined | null) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const p: any = payload;
    if (p.userId && typeof p.userId !== 'string') {
      try {
        const s = p.userId.toString();
        if (s && !s.startsWith('[object')) {
          p.userId = s;
        } else if ((p.userId as any)._bsontype && (p.userId as any).id) {
          p.userId = Buffer.from((p.userId as any).id).toString('hex');
        } else if ((p.userId as any).buffer) {
          const arr = Object.values((p.userId as any).buffer as any) as number[];
          p.userId = Buffer.from(arr).toString('hex');
        } else if (Array.isArray(p.userId)) {
          p.userId = Buffer.from(p.userId as any as number[]).toString('hex');
        } else {
          p.userId = String(p.userId);
        }
      } catch (err) {
        p.userId = String(p.userId);
      }
    }

    return p;
  } catch (err) {
    return null;
  }
}
// 3. ลบ Session (แก้ไขส่วนนี้: ต้องหุ้มด้วย export async function)
export async function deleteSession() {
  const cookieStore = await cookies();
  
  // เขียนทับด้วย Cookie ที่หมดอายุแล้ว เพื่อบังคับลบ
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // หมดอายุทันที (1970)
    sameSite: 'lax',
    path: '/',
  });
}