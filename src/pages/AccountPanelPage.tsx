import React from 'react';
import { AdminDashboardInner } from '../admin/AdminApp';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const AccountPanelPage: React.FC = () => {
  useDocumentHead({
    title: 'Account Holder Control Panel — Private Access',
    description: 'Private management panel for adding, editing, and removing prompt recipes and reference images.',
  });

  return <AdminDashboardInner />;
};

export default AccountPanelPage;
