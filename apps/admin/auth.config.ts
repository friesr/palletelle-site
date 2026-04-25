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
      const isBootstrapPage = pathname === '/bootstrap-security';

      if (isLoginPage || isAuthRoute) {
        return true;
      }

      if (auth?.user?.role !== 'admin') {
        return false;
      }

      if (auth.user.securityState === 'active') {
        return true;
      }

      if (isBootstrapPage) {
        return true;
      }

      return Response.redirect(new URL('/bootstrap-security', request.nextUrl));
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.securityState = user.securityState;
        token.authMethod = user.authMethod;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as 'admin' | undefined;
        session.user.securityState = token.securityState as 'bootstrap' | 'active' | undefined;
        session.user.authMethod = token.authMethod as 'password' | 'passkey' | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
