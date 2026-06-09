'use client';

import React from 'react';
import { SidebarLayout } from '@/components/layout/AppLayout';
import { UserManagement } from '@/components/admin/UserManagement';

export default function TeamPage() {
  return (
    <SidebarLayout>
      <UserManagement />
    </SidebarLayout>
  );
}
