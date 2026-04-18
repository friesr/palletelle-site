import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import authConfig from '@/auth.config';
import { getSeededAdminUser, getSeededAdminValidation } from '@/lib/auth/seeded-admin';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Admin login',
      credentials: {
        login: { label: 'Email or username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validation = getSeededAdminValidation();
        if (!validation.valid) {
          console.error('Admin auth configuration invalid:', validation.reasons.join(', '));
          return null;
        }

        const login = credentials?.login?.toString().trim();
        const password = credentials?.password?.toString();
        const admin = getSeededAdminUser();

        if (!login || !password || !admin) {
          return null;
        }

        const matchesLogin = login.toLowerCase() === admin.login.toLowerCase();
        if (!matchesLogin) {
          return null;
        }

        const passwordMatches = await compare(password, admin.passwordHash);
        if (!passwordMatches) {
          return null;
        }

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
});
