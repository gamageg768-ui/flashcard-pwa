import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function getNote(noteId: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.userId !== userId) return null;
  return note;
}

export async function GET(_req: NextRequest, { params }: { params: { noteId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const note = await prisma.note.findUnique({
    where: { id: params.noteId },
    include: { deck: { select: { id: true, title: true, color: true } } },
  });

  if (!note || note.userId !== session.user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ note });
}

export async function PATCH(req: NextRequest, { params }: { params: { noteId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const note = await getNote(params.noteId, session.user.id);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.note.update({
    where: { id: params.noteId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.deckId !== undefined && { deckId: body.deckId || null }),
    },
  });

  return NextResponse.json({ note: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { noteId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const note = await getNote(params.noteId, session.user.id);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.note.delete({ where: { id: params.noteId } });
  return NextResponse.json({ success: true });
}
