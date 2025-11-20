'use client';

import '@/styles/globals.css';
import { useState } from 'react';
import { UserContext } from '@/utils/userContext';

export default function App({ Component, pageProps }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ token, setToken, user, setUser }}>
      <div className="min-h-screen bg-gray-50">
        <Component {...pageProps} />
      </div>
    </UserContext.Provider>
  );
}
