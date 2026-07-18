import React from 'react';
import { ClipboardList } from 'lucide-react-native';
import { PlaceholderScreen } from '@/components/common';

export default function GuardLogsTab() {
  return (
    <PlaceholderScreen
      title="Entry / Exit Log"
      subtitle="Review today's gate activity — who entered, exited, and when."
      Icon={ClipboardList}
    />
  );
}
