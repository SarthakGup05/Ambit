import React from 'react';
import { LayoutGrid } from 'lucide-react-native';
import { PlaceholderScreen } from '@/components/common';

export default function AdminAmenitiesScreen() {
  return (
    <PlaceholderScreen
      title="Amenities Management"
      subtitle="Configure society amenities, set capacity limits, and review resident reservation logs."
      Icon={LayoutGrid}
    />
  );
}
