import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

function escapeCSV(val: string | null | undefined): string {
  if (!val) return '';
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deck = await prisma.deck.findUnique({
    where: { id: params.id },
    include: { cards: { orderBy: { createdAt: 'asc' } } },
  });

  if (!deck || deck.userId !== session.user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = ['front,back,hint,tags'];
  for (const card of deck.cards) {
    rows.push([
      escapeCSV(card.front),
      escapeCSV(card.back),
      escapeCSV(card.hint),
      escapeCSV(card.tags),
    ].join(','));
  }

  const csv = rows.join('\n');
  const filename = deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  });
}
