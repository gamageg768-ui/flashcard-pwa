import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deck = await prisma.deck.findUnique({ where: { id: params.id } });
  if (!deck || deck.userId !== session.user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { cards } = await req.json();
  if (!Array.isArray(cards) || cards.length === 0)
    return NextResponse.json({ error: 'No cards provided' }, { status: 400 });

  const result = await prisma.card.createMany({
    data: cards.map((c: any) => ({
      front: String(c.front).trim(),
      back: String(c.back).trim(),
      hint: c.hint ? String(c.hint).trim() : null,
      tags: c.tags ? String(c.tags).trim() : null,
      deckId: deck.id,
    })),
  });

  return NextResponse.json({ count: result.count });
}
