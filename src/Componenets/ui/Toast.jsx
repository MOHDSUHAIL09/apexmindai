// components/Toast.jsx
import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '10px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          duration: 3000,
          style: {
            background: '#10b981',
            color: 'white',
          },
        },
        error: {
          duration: 3000,
          style: {
            background: '#ef4444',
            color: 'white',
          },
        },
      }}
    />
  );
};

export default Toast;