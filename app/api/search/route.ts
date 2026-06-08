import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json({ decks: [], cards: [], notes: [] });

  const userId = session.user.id;

  const [decks, cards, notes] = await Promise.all([
    prisma.deck.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { topic: { contains: q } },
        ],
      },
      select: { id: true, title: true, description: true, color: true },
      take: 10,
    }),
    prisma.card.findMany({
      where: {
        deck: { userId },
        OR: [
          { front: { contains: q } },
          { back: { contains: q } },
        ],
      },
      select: {
        id: true,
        front: true,
        back: true,
        deckId: true,
        deck: { select: { title: true, color: true } },
      },
      take: 15,
    }),
    prisma.note.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      select: { id: true, title: true, summary: true, deckId: true },
      take: 10,
    }),
  ]);

  return NextResponse.json({ decks, cards, notes });
}
