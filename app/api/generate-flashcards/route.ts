import { NextRequest, NextResponse } from 'next/server';
import { generateFlashcards, explainCard, generateHint, chatWithAI } from '@/lib/groq';

// POST: generate flashcards
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, count = 10, difficulty = 'intermediate', style = 'qa' } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
    }

    const cards = await generateFlashcards({
      topic: topic.trim(),
      count: Math.min(Math.max(1, count), 50),
      difficulty,
      style,
    });

    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}

// PUT: explain card, get hint, or chat
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
    }

    switch (action) {
      case 'explain': {
        const { front, back } = body;
        if (!front || !back) return NextResponse.json({ error: 'Card data required' }, { status: 400 });
        const explanation = await explainCard(front, back);
        return NextResponse.json({ explanation });
      }

      case 'hint': {
        const { front, back } = body;
        if (!front || !back) return NextResponse.json({ error: 'Card data required' }, { status: 400 });
        const hint = await generateHint(front, back);
        return NextResponse.json({ hint });
      }

      case 'chat': {
        const { messages, context } = body;
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
        }
        const response = await chatWithAI(messages, context);
        return NextResponse.json({ response });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('AI action error:', error);
    return NextResponse.json(
      { error: error.message || 'AI request failed' },
      { status: 500 }
    );
  }
}
