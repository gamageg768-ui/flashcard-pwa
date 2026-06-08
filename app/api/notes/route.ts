import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deckId = req.nextUrl.searchParams.get('deckId');

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      ...(deckId ? { deckId } : {}),
    },
    select: {
      id: true,
      title: true,
      summary: true,
      deckId: true,
      deck: { select: { title: true, color: true } },
      createdAt: true,
      updatedAt: true,
      content: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content, deckId } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const note = await prisma.note.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      userId: session.user.id,
      deckId: deckId || null,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}
