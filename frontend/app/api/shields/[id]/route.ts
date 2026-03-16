import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const db = await getDb();

    await db.collection('shields').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('PATCH /api/shields/[id] error:', e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
