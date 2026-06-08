import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {},
      async authorize() {
        const guestEmail = `guest_${crypto.randomUUID()}@guest.local`;
        const guest = await prisma.user.create({
          data: { email: guestEmail, name: 'Guest', isGuest: true },
        });
        return { id: guest.id, email: guest.email, name: guest.name, isGuest: true };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isGuest = (user as any).isGuest ?? false;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.isGuest = token.isGuest as boolean;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ['/deck', '/study'];
      const isProtected = protectedPaths.some(p => nextUrl.pathname.startsWith(p));
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
  },
});
