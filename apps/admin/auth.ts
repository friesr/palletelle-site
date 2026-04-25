import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import authConfig from '@/auth.config';
import { authorizeAdminBootstrapSignIn, getAdminIdentityValidation } from '@/lib/auth/admin-access';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Admin login',
      credentials: {
        email: { label: 'Admin email', type: 'email' },
        password: { label: 'Bootstrap password', type: 'password' },
      },
      async authorize(credentials) {
        const validation = getAdminIdentityValidation();
        if (!validation.valid) {
          console.error('Admin auth configuration invalid:', validation.reasons.join(' '));
          return null;
        }

        const email = credentials?.email?.toString().trim();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        return authorizeAdminBootstrapSignIn(email, password);
      },
    }),
  ],
});
