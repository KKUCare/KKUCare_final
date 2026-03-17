// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Issue from '../../models/Issue';
import { verifySession } from '../../lib/auth';

export async function GET(request: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    // 1. ภาพรวมทั้งหมด
    const totalIssues = await Issue.countDocuments();
    const totalResolved = await Issue.countDocuments({ status: 'resolved' });
    const totalInProgress = await Issue.countDocuments({ status: 'in_progress' });
    const totalPending = await Issue.countDocuments({ status: 'pending' });

    // 2. รายชื่อหมวดหมู่ตั้งต้นที่ต้องมีเสมอ (แม้จะเป็น 0 ก็จะโชว์ใน Dropdown)
    const defaultCategories = [
      'ทั่วไป', 
      'ไฟฟ้า/แสงสว่าง', 
      'ประปา', 
      'ไอที/เครือข่าย', 
      'ความปลอดภัย/จราจร', 
      'ความสะอาด/ขยะ'
    ];

    // 3. ดึงหมวดหมู่ทั้งหมดที่มีคนแจ้งจริงๆ จากฐานข้อมูล
    const dbCategories = await Issue.distinct('category');

    // 4. นำหมวดหมู่ตั้งต้น มารวมกับ หมวดหมู่ใน DB และตัดตัวที่ซ้ำกันออก (Set)
    const allCategories = Array.from(new Set([...defaultCategories, ...dbCategories]));
    
    const stats = [];

    // วนลูปนับข้อมูลตามรายชื่อหมวดหมู่ที่รวมแล้ว
    for (const cat of allCategories) {
      const total = await Issue.countDocuments({ category: cat });
      const resolved = await Issue.countDocuments({ category: cat, status: 'resolved' });
      const inProgress = await Issue.countDocuments({ category: cat, status: 'in_progress' });
      const pending = await Issue.countDocuments({ category: cat, status: 'pending' });

      stats.push({
        category: cat,
        total,
        resolved,
        inProgress,
        pending,
        successRate: total === 0 ? 0 : Math.round((resolved / total) * 100)
      });
    }

    return NextResponse.json({
      stats,
      overview: {
        totalIssues,
        totalResolved,
        totalInProgress,
        totalPending
      }
    });

  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}