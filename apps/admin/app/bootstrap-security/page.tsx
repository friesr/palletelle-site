import { redirect } from 'next/navigation';
import { getAdminSecuritySnapshot } from '@/lib/auth/admin-access';
import { requireAdmin } from '@/lib/auth/session';
import { LogoutButton } from '@/components/logout-button';

export const dynamic = 'force-dynamic';

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      style={{
        borderRadius: 999,
        padding: '10px 14px',
        border: `1px solid ${ok ? 'rgba(48, 122, 78, 0.28)' : 'rgba(138, 59, 52, 0.18)'}`,
        background: ok ? 'rgba(48, 122, 78, 0.08)' : 'rgba(138, 59, 52, 0.07)',
        color: ok ? '#2E6B46' : '#8A3B34',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {ok ? 'Ready' : 'Blocked'}: {label}
    </div>
  );
}

export default async function BootstrapSecurityPage() {
  const session = await requireAdmin({ allowBootstrap: true });
  const snapshot = await getAdminSecuritySnapshot();

  if (session.user.securityState === 'active') {
    redirect('/');
  }

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 24, padding: 28 }}>
      <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.55 }}>Admin security bootstrap</p>
      <h1 style={{ margin: '10px 0 0', fontSize: 30 }}>Complete passkey and MFA setup before using the command center</h1>
      <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.7, color: 'rgba(0,0,0,0.72)' }}>
        Password bootstrap is now a temporary bridge only. Full admin routes stay locked until this named admin account has at least one passkey and one verified MFA enrollment in the database.
      </p>

      <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
        <StatusPill label={`Named admin email set to ${snapshot?.email ?? session.user.email ?? 'unknown'}`} ok={Boolean(snapshot?.email)} />
        <StatusPill label="Admin passkey registered" ok={Boolean(snapshot?.hasPasskey)} />
        <StatusPill label="Admin MFA verified" ok={Boolean(snapshot?.hasVerifiedMfa)} />
      </div>

      <div style={{ marginTop: 24, borderRadius: 18, background: '#F7F7F5', padding: 18 }}>
        <p style={{ margin: 0, fontWeight: 700 }}>What is implemented now</p>
        <ul style={{ margin: '12px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
          <li>named admin email validation</li>
          <li>bootstrap-password access isolated from full admin routes</li>
          <li>route gating that requires passkey plus MFA state before normal admin access</li>
        </ul>
      </div>

      <div style={{ marginTop: 20, borderRadius: 18, background: '#FFF4F3', border: '1px solid rgba(138,59,52,0.12)', padding: 18 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#8A3B34' }}>Remaining blocker</p>
        <p style={{ margin: '8px 0 0', color: '#8A3B34', lineHeight: 1.7 }}>
          A passkey registration flow and an MFA enrollment flow still need to be wired into the admin app. Until then, this page is the only allowed destination after bootstrap sign in.
        </p>
      </div>


      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <LogoutButton />
      </div>
    </section>
  );
}
