"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/login';
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading && pathname !== '/login') {
     // You might want to show a global loading spinner here
     // For now, rendering children directly or null for protected routes during load
     return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  }
  
  // Allow access to login page even when loading or no user
  if (pathname === '/login') {
    return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>;
  }

  // For protected routes, ensure user is loaded and present
  if (!loading && !user && pathname !== '/login') {
    // This case should be handled by the redirect effect, but as a fallback:
    return <div className="flex items-center justify-center min-h-screen"><p>Redirecting to login...</p></div>;
  }


  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
