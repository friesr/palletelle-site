import type { NextAuthConfig } from 'next-auth';

const authConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoginPage = pathname === '/login';
      const isAuthRoute = pathname.startsWith('/api/auth');

      if (isLoginPage || isAuthRoute) {
        return true;
      }

      return auth?.user?.role === 'admin';
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as 'admin' | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
