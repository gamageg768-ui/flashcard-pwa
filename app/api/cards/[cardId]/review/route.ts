import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateNextReview } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { rating } = await req.json();

    if (!rating || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating (1-4)' }, { status: 400 });
    }

    // Verify card belongs to user
    const card = await prisma.card.findFirst({
      where: {
        id: params.cardId,
        deck: { userId: session.user.id },
      },
    });

    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });

    const { nextReview, newDifficulty } = calculateNextReview(card.difficulty, rating);

    // Update card and create review record
    const [updatedCard] = await prisma.$transaction([
      prisma.card.update({
        where: { id: card.id },
        data: {
          difficulty: newDifficulty,
          nextReview,
          reviewCount: { increment: 1 },
        },
      }),
      prisma.cardReview.create({
        data: {
          cardId: card.id,
          rating,
        },
      }),
    ]);

    return NextResponse.json({ card: updatedCard, nextReview });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
