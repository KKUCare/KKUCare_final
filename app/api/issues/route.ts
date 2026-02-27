// app/api/issues/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Issue from '../../models/Issue';
import { verifySession } from '../../lib/auth';

// --- Helper: แปลงไฟล์เป็น Base64 ---
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

// --- POST: รับแจ้งปัญหา ---
export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;

    let imageBase64 = '';
    if (imageFile && imageFile.size > 0) {
      imageBase64 = await fileToBase64(imageFile);
    }

    await dbConnect();

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `ISS-${dateStr}-${randomSuffix}`;

    await Issue.create({
      ticketId,
      reporter: {
        userId: session.userId,
        name: session.name,
        email: session.email,
      },
      title,
      category,
      location,
      description,
      image: imageBase64,
      status: 'pending'
    });

    // Trigger N8N
    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          reporter: session.name,
          email: session.email,
          title,
          category,
          location,
          description,
          status: 'pending',
          timestamp: new Date().toISOString(),
          image: imageBase64 
        }),
      }).catch(err => console.error('N8N Trigger Error:', err));
    }

    return NextResponse.json({ success: true, ticketId, message: 'บันทึกข้อมูลเรียบร้อย' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- GET: ดึงข้อมูล (อัปเดตส่วนนี้!) ---
export async function GET(request: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode'); // ?mode=admin

    let filter = {};

    // 1. ถ้าเป็นโหมด Admin/Staff Dashboard
    if (mode === 'admin') {
      
      // ตรวจสอบ Role ของคนเรียก API (RBAC Logic) 🛡️
      switch (session.role) {
        case 'admin':
          filter = {}; // Admin เห็นทั้งหมด
          break;

        case 'staff_electricity':
          filter = { category: 'ไฟฟ้า/แสงสว่าง' }; // เห็นเฉพาะงานไฟฟ้า
          break;

        case 'staff_water':
          filter = { category: 'ประปา' }; // เห็นเฉพาะงานประปา
          break;

        case 'staff_it':
          filter = { category: 'ไอที/เครือข่าย' }; // เห็นเฉพาะ IT
          break;
          
        case 'staff_cleaning':
          filter = { category: 'ความสะอาด' }; // ตรงกับ value ในหน้า Frontend
          break;

        case 'staff_security':
          filter = { category: 'ความปลอดภัย' };
          break;

        case 'staff_general':
          filter = { category: 'ทั่วไป' };
          break;

        default:
          // ถ้า User ธรรมดา หรือ Role ประหลาดๆ พยายามเข้าโหมด Admin
          // ให้เห็นเฉพาะของตัวเอง (หรือจะ return empty ก็ได้)
          filter = { 'reporter.userId': session.userId };
      }
      
    } else {
      // 2. โหมด User ทั่วไป (ดู Status ของตัวเอง)
      filter = { 'reporter.userId': session.userId };
    }

    // ดึงข้อมูลตาม Filter ที่ตั้งไว้
    const issues = await Issue.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ issues });

  } catch (error) {
    console.error("GET Issues Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}