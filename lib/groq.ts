import Groq from 'groq-sdk';

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  }
  return _groq;
}

export interface GeneratedCard {
  front: string;
  back: string;
  hint?: string;
  tags?: string;
}

export interface GenerateFlashcardsOptions {
  topic: string;
  count?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  style?: 'definition' | 'qa' | 'fill-blank' | 'concept';
}

export async function generateFlashcards(options: GenerateFlashcardsOptions): Promise<GeneratedCard[]> {
  const { topic, count = 10, difficulty = 'intermediate', style = 'qa' } = options;

  const styleGuide = {
    definition: 'term on the front, definition on the back',
    qa: 'question on the front, detailed answer on the back',
    'fill-blank': 'sentence with a blank on the front, the missing word/phrase on the back',
    concept: 'concept name on the front, explanation + example on the back',
  };

  const prompt = `Generate ${count} high-quality flashcards about "${topic}" at ${difficulty} level.
Format: ${styleGuide[style]}

Requirements:
- Clear, concise fronts (questions/terms)
- Thorough, accurate backs (answers/definitions)
- Optional hints for harder cards
- Relevant tags (comma-separated)
- No duplicate cards
- Accurate, educational content

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "front": "...",
    "back": "...",
    "hint": "optional hint string or null",
    "tags": "tag1,tag2,tag3"
  }
]`;

  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert educator and flashcard creator. Always respond with valid JSON arrays only. No markdown, no backticks, no explanation text.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content || '[]';

  // Strip any markdown code blocks if present
  const cleaned = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleaned) as GeneratedCard[];
}

export async function explainCard(front: string, back: string): Promise<string> {
  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful tutor. Give clear, engaging explanations. Use examples and analogies. Keep responses under 200 words.',
      },
      {
        role: 'user',
        content: `Please explain this flashcard in more detail:\n\nFront: ${front}\nBack: ${back}\n\nProvide a deeper explanation with examples.`,
      },
    ],
    temperature: 0.6,
    max_tokens: 400,
  });

  return completion.choices[0]?.message?.content || 'No explanation available.';
}

export async function generateHint(front: string, back: string): Promise<string> {
  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful tutor. Generate a subtle hint that helps without giving away the answer. Keep it under 50 words.',
      },
      {
        role: 'user',
        content: `Generate a helpful hint for this flashcard:\n\nQuestion/Term: ${front}\nAnswer: ${back}\n\nGive a hint that nudges toward the answer without revealing it.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });

  return completion.choices[0]?.message?.content || '';
}

export async function chatWithAI(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: string
): Promise<string> {
  const systemPrompt = context
    ? `You are a helpful AI tutor. The student is studying: ${context}. Help them understand concepts, answer questions, and reinforce their learning. Be concise and educational.`
    : 'You are a helpful AI tutor. Help students understand and learn various concepts. Be concise, clear, and educational.';

  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  return completion.choices[0]?.message?.content || 'I could not generate a response.';
}

export async function summariseNote(content: string): Promise<string> {
  const trimmed = content.slice(0, 4000);
  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a study assistant. Summarise the given notes into 3-5 concise bullet points. Use plain text bullets starting with "• ". Be factual and precise. No markdown headers or code blocks.',
      },
      { role: 'user', content: `Summarise these notes:\n\n${trimmed}` },
    ],
    temperature: 0.4,
    max_tokens: 500,
  });
  return completion.choices[0]?.message?.content?.trim() || 'Could not generate summary.';
}

export async function extractCardsFromNote(content: string): Promise<GeneratedCard[]> {
  const trimmed = content.slice(0, 4000);
  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert flashcard creator. Extract key concepts from the notes and create flashcards. Return ONLY a valid JSON array (no markdown, no backticks, no explanation):\n[{"front":"...","back":"...","hint":"optional or null","tags":"tag1,tag2"}]',
      },
      { role: 'user', content: `Create flashcards from these notes:\n\n${trimmed}` },
    ],
    temperature: 0.5,
    max_tokens: 3000,
  });

  const raw = completion.choices[0]?.message?.content || '[]';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as GeneratedCard[];
}

export default getGroq;
