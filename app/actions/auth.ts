'use server';
import { signIn } from '@/lib/auth';

export async function signInAsGuest() {
  await signIn('credentials', { redirectTo: '/dashboard' });
}
