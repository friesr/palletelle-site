import nodemailer from 'nodemailer';

function readEnv(name: string) {
  return process.env[name]?.trim();
}

export function getSmtpConfig() {
  const host = readEnv('SMTP_HOST');
  const port = Number(readEnv('SMTP_PORT') || '465');
  const user = readEnv('SMTP_USER');
  const pass = readEnv('SMTP_PASS');
  const from = readEnv('SMTP_FROM');
  const secure = (readEnv('SMTP_SECURE') || 'true').toLowerCase() !== 'false';

  return {
    host,
    port,
    user,
    pass,
    from,
    secure,
    ready: Boolean(host && port && user && pass && from),
  };
}

export async function sendAuthBootstrapEmail(to: string) {
  const config = getSmtpConfig();
  if (!config.ready || !config.host || !config.user || !config.pass || !config.from) {
    throw new Error('SMTP auth mail configuration is incomplete.');
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return transport.sendMail({
    from: config.from,
    to,
    subject: 'Palletelle admin bootstrap sign-in detected',
    text: [
      'A Palletelle admin bootstrap sign-in just occurred for this email address.',
      '',
      'If this was you, continue setup in the admin security bootstrap screen.',
      'If this was not you, rotate the bootstrap password immediately.',
    ].join('\n'),
  });
}
