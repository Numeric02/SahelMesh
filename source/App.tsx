import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NetworkProvider } from '@/contexts/NetworkContext';
import AppRoutes from '@/routes';
import { Toaster } from 'sonner';
import '@/i18n';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NetworkProvider>
        <AppRoutes />
        <Toaster position="top-center" expand={false} richColors closeButton />
      </NetworkProvider>
    </BrowserRouter>
  );
};

export default App;