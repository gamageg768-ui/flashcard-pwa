import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { summariseNote, extractCardsFromNote } from '@/lib/groq';

export async function POST(req: NextRequest, { params }: { params: { noteId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const note = await prisma.note.findUnique({ where: { id: params.noteId } });
  if (!note || note.userId !== session.user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!process.env.GROQ_API_KEY)
    return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 });

  const { action } = await req.json();

  if (action === 'summarise') {
    const summary = await summariseNote(note.content);
    await prisma.note.update({ where: { id: note.id }, data: { summary } });
    return NextResponse.json({ summary });
  }

  if (action === 'extract-cards') {
    const cards = await extractCardsFromNote(note.content);
    return NextResponse.json({ cards });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
