'use server';

import { sendAuthBootstrapEmail } from '@/lib/auth/smtp-mailer';

export async function sendBootstrapAuthEmail(email: string) {
  await sendAuthBootstrapEmail(email);
}
