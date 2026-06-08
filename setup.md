# FlashAI — Setup Guide

AI-powered flashcard PWA built with Next.js 14, Groq AI (Llama 3 70B), Prisma, and NextAuth.js.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Your Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com) and sign up (free)
2. Create a new API key
3. Copy it into `.env.local`:

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

### 3. Configure Auth

Generate a secret:
```bash
openssl rand -base64 32
```

Add to `.env.local`:
```env
AUTH_SECRET=your_generated_secret_here
```

**Google OAuth (optional):**
1. Go to [Google Console](https://console.developers.google.com)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

**GitHub OAuth (optional):**
1. Go to [GitHub Settings → Developer Settings](https://github.com/settings/applications/new)
2. Set callback URL: `http://localhost:3000/api/auth/callback/github`

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to SQLite
npx prisma db push
```

### 5. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📦 Production Build

```bash
npm run build
npm start
```

The PWA service worker is only active in production builds.

---

## 🗃️ Database

### Switch to PostgreSQL (Recommended for Production)

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env.local`:
```env
DATABASE_URL="postgresql://user:password@host:5432/flashai"
```

3. Run migration:
```bash
npx prisma db push
```

### View your data
```bash
npx prisma studio
```

---

## 🧠 AI Features

All AI features use **Groq's Llama 3 70B** model (`llama-3.3-70b-versatile`):

| Feature | Endpoint | Description |
|---|---|---|
| Generate Cards | `POST /api/generate-flashcards` | Create full decks from a topic |
| AI Explain | `PUT /api/generate-flashcards` (action: explain) | Deep explanation of a card |
| Hint | `PUT /api/generate-flashcards` (action: hint) | Nudge without revealing answer |
| AI Chat | `PUT /api/generate-flashcards` (action: chat) | Full tutor chat session |

---

## 📱 PWA Installation

1. Run production build: `npm run build && npm start`
2. Open in Chrome/Edge/Safari
3. Click "Add to Home Screen" or the install prompt
4. Works offline after first load

---

## 📂 Project Structure

```
flashcard-pwa/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # User's decks
│   ├── login/page.tsx        # Auth page
│   ├── deck/
│   │   ├── new/page.tsx      # Create deck + AI generate
│   │   └── [id]/
│   │       ├── page.tsx      # Deck detail
│   │       └── study/page.tsx # Study mode with flashcards
│   └── api/
│       ├── generate-flashcards/route.ts  # Groq AI endpoint
│       ├── decks/route.ts               # CRUD decks
│       ├── decks/[id]/route.ts          # Single deck
│       ├── decks/[id]/cards/route.ts    # Cards for study
│       └── cards/[cardId]/review/route.ts # Spaced repetition
├── components/Navbar.tsx
├── lib/
│   ├── groq.ts   # Groq + Llama 70b client
│   ├── auth.ts   # NextAuth config
│   ├── db.ts     # Prisma client
│   └── utils.ts  # SM-2 spaced repetition
├── prisma/schema.prisma
└── public/manifest.json
```

---

## 🎯 Features

- ✅ AI flashcard generation (Groq + Llama 3 70B)
- ✅ 4 card styles: Q&A, Definition, Fill-blank, Concept
- ✅ 3D flip animation study mode
- ✅ Spaced repetition (SM-2 algorithm)
- ✅ AI explanations per card
- ✅ AI hints without revealing answers
- ✅ Built-in AI tutor chat
- ✅ Progress tracking
- ✅ PWA — installable on any device
- ✅ Offline support
- ✅ Auth with Google + GitHub
- ✅ SQLite (dev) / PostgreSQL (prod)

---

## 🔐 Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Use a strong `AUTH_SECRET` in production (32+ chars)
- Rotate your Groq API key if exposed
