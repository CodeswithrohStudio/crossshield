import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')?.toLowerCase();
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  try {
    const db = await getDb();
    const shields = await db
      .collection('shields')
      .find({ walletAddress: address })
      .sort({ openedAt: -1 })
      .toArray();
    return NextResponse.json({ shields });
  } catch (e) {
    console.error('GET /api/shields error:', e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, txHash, shieldId, assetId, assetName, assetEmoji, leverage, entryPrice, marginUsed } = body;
    if (!walletAddress || !txHash || assetId === undefined || !leverage) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();

    await db.collection('shields').insertOne({
      walletAddress: walletAddress.toLowerCase(),
      txHash,
      shieldId: shieldId ?? null,
      assetId: Number(assetId),
      assetName: assetName ?? '',
      assetEmoji: assetEmoji ?? '',
      leverage: Number(leverage),
      entryPrice: entryPrice ?? '0',
      marginUsed: marginUsed ?? '0',
      status: 'open',
      realizedPnl: '0',
      openedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('POST /api/shields error:', e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
