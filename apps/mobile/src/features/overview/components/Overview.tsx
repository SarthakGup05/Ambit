import React from 'react';
import { Screen, SectionHeader } from '@repo/ui';
import { HomeHeader } from './HomeHeader';
import { PendingVisitorCard } from './PendingVisitorCard';
import { QuickActions } from './QuickActions';
import { RecentVisitors } from './RecentVisitors';
import { LatestNotice } from './LatestNotice';

export function Overview() {
  return (
    <Screen className="flex-1 bg-[#FAF8F5]">
      <HomeHeader />

      <PendingVisitorCard />

      <SectionHeader title="Quick Actions" />
      <QuickActions />

      <SectionHeader title="Recent Visitors" />
      <RecentVisitors />

      <SectionHeader title="Latest Notice" />
      <LatestNotice />
    </Screen>
  );
}
