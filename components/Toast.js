'use client';

import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: 'var(--font-poppins)',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          fontWeight: 500,
        },
        success: {
          className: 'toast-success',
          iconTheme: {
            primary: 'white',
            secondary: '#4caf50',
          },
        },
        error: {
          className: 'toast-error',
          iconTheme: {
            primary: 'white',
            secondary: '#f44336',
          },
        },
      }}
    />
  );
}
