import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET all decks for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decks = await prisma.deck.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { cards: true } },
        cards: {
          select: { difficulty: true, nextReview: true },
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const now = new Date();

    const formatted = decks.map(deck => ({
      id: deck.id,
      title: deck.title,
      description: deck.description,
      color: deck.color,
      cardCount: deck._count.cards,
      dueCount: deck.cards.filter(c => new Date(c.nextReview) <= now).length,
      lastStudied: deck.sessions[0]?.createdAt,
    }));

    // Global stats
    const allCards = await prisma.card.findMany({
      where: { deck: { userId: session.user.id } },
      select: { difficulty: true, nextReview: true },
    });

    const stats = {
      totalCards: allCards.length,
      dueToday: allCards.filter(c => new Date(c.nextReview) <= now).length,
      mastered: allCards.filter(c => c.difficulty >= 4).length,
      streak: 0, // TODO: calculate from sessions
    };

    return NextResponse.json({ decks: formatted, stats });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: create a new deck with cards
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, color = '#6366f1', topic, cards = [] } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const deck = await prisma.deck.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        color,
        topic: topic?.trim() || null,
        userId: session.user.id,
        cards: {
          create: cards.map((card: any) => ({
            front: card.front,
            back: card.back,
            hint: card.hint || null,
            tags: card.tags || null,
          })),
        },
      },
      include: { _count: { select: { cards: true } } },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
