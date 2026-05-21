import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layouts/Layout';
import HomePage from '@/pages/HomePage';
import MessageFeedPage from '@/pages/MessageFeedPage';
import SendMessagePage from '@/pages/SendMessagePage';
import QRExchangePage from '@/pages/QRExchangePage';
import NetworkView from '@/pages/NetworkView';

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/network" element={<NetworkView />} />
        <Route path="/messages" element={<MessageFeedPage />} />
        <Route path="/send" element={<SendMessagePage />} />
        <Route path="/qr" element={<QRExchangePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;