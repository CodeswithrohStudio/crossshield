import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')?.toLowerCase();
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  try {
    const db = await getDb();
    const deposit = await db.collection('deposits').findOne(
      { walletAddress: address },
      { sort: { depositedAt: -1 } }
    );
    return NextResponse.json({ deposit: deposit ?? null });
  } catch (e) {
    console.error('GET /api/deposits error:', e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, txHash, amount, maturityDays } = body;
    if (!walletAddress || !txHash || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();
    const maturityTime = new Date(now.getTime() + (maturityDays ?? 365) * 24 * 60 * 60 * 1000);

    await db.collection('deposits').updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $set: {
          walletAddress: walletAddress.toLowerCase(),
          txHash,
          amount: Number(amount),
          depositedAt: now,
          maturityTime,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('POST /api/deposits error:', e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
