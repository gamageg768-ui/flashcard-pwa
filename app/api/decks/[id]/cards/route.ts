import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify deck ownership
    const deck = await prisma.deck.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { title: true },
    });

    if (!deck) return NextResponse.json({ error: 'Deck not found' }, { status: 404 });

    // Get due cards first, then new cards
    const now = new Date();
    const cards = await prisma.card.findMany({
      where: { deckId: params.id },
      orderBy: [
        { nextReview: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      cards,
      deckTitle: deck.title,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
