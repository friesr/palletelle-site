import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role?: 'admin';
    };
  }

  interface User {
    role?: 'admin';
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: 'admin';
  }
}
