import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role?: 'admin';
      securityState?: 'bootstrap' | 'active';
      authMethod?: 'password' | 'passkey';
    };
  }

  interface User {
    role?: 'admin';
    securityState?: 'bootstrap' | 'active';
    authMethod?: 'password' | 'passkey';
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: 'admin';
    securityState?: 'bootstrap' | 'active';
    authMethod?: 'password' | 'passkey';
  }
}
