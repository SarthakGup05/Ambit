import React from 'react';
import { UserPlus } from 'lucide-react-native';
import { PlaceholderScreen } from '@/components/common';

export default function GuardVisitorsTab() {
  return (
    <PlaceholderScreen
      title="Visitors"
      subtitle="Register visitors at the gate, search residents, and manage approval requests."
      Icon={UserPlus}
    />
  );
}
