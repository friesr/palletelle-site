import { ProfileOnboardingShell } from '@/components/profile-onboarding-shell';

export const metadata = {
  title: 'Start your profile | Palletelle',
  description: 'Create and save a local Palletelle profile draft so color-led recommendations have usable context.',
};

export default function ProfilePage() {
  return <ProfileOnboardingShell />;
}
