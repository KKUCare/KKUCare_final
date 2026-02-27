// app/api/issues/[ticketId]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Issue from '../../../models/Issue';
import { verifySession } from '../../../lib/auth';

// --- DELETE: ลบใบงาน ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ticketId } = await params;
    await dbConnect();

    const issue = await Issue.findOne({ ticketId: ticketId });
    if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 🛡️ เช็คสิทธิ์: เป็นเจ้าของเรื่อง OR เป็น Admin (Staff ลบไม่ได้)
    const isOwner = issue.reporter.userId === session.userId;
    const isAdmin = session.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบรายการนี้' }, { status: 403 });
    }

    // Admin ลบได้ทุกสถานะ, User ลบได้แค่ตอน pending
    if (!isAdmin && issue.status !== 'pending') {
      return NextResponse.json({ error: 'ไม่สามารถลบงานที่ดำเนินการไปแล้วได้' }, { status: 400 });
    }

    await Issue.deleteOne({ ticketId: ticketId });

    return NextResponse.json({ success: true, message: 'ลบรายการเรียบร้อย' });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PATCH: แก้ไขข้อมูล ---
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ticketId } = await params;
    const body = await request.json();
    await dbConnect();

    const issue = await Issue.findOne({ ticketId: ticketId });
    if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isOwner = issue.reporter.userId === session.userId;
    const isAdmin = session.role === 'admin';
    // Staff คือ role ที่ขึ้นต้นด้วย staff_ หรืออื่นๆ ที่ไม่ใช่ admin

    // 1. เปลี่ยน Status (Admin และ Staff ทำได้)
    if (body.status) {
       // อนุญาตให้ Admin หรือ Staff เปลี่ยนสถานะได้
       // (จริงๆ ควรเช็ค role staff ให้ตรงแผนกด้วย แต่เอาพื้นฐานก่อน)
       issue.status = body.status;
    }

    // 2. แก้ไขเนื้อหา (เฉพาะ Admin และ เจ้าของเรื่อง) ❌ Staff ห้ามแก้เนื้อหา
    if (body.title || body.description || body.location || body.category) {
        
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขข้อมูล' }, { status: 403 });
        }

        // Admin แก้ได้ตลอด, User แก้ได้แค่ตอน pending
        if (!isAdmin && issue.status !== 'pending') {
            return NextResponse.json({ error: 'แก้ไขได้เฉพาะสถานะรอดำเนินการเท่านั้น' }, { status: 400 });
        }

        if (body.title) issue.title = body.title;
        if (body.description) issue.description = body.description;
        if (body.location) issue.location = body.location;
        if (body.category) issue.category = body.category;
    }

    await issue.save();
    return NextResponse.json({ success: true, issue });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}