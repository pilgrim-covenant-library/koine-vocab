'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuthStore, isFirebaseAvailable } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

interface AuthGateProps {
  children: React.ReactNode;
  /** Custom message to show when not logged in */
  message?: string;
  /** Custom title for the login prompt */
  title?: string;
}

/**
 * AuthGate - Requires user to be logged in before accessing content
 *
 * Usage:
 * ```tsx
 * <AuthGate>
 *   <ProtectedContent />
 * </AuthGate>
 * ```
 */
export function AuthGate({
  children,
  message = 'Please log in to access this content.',
  title = 'Login Required'
}: AuthGateProps) {
  const { user, isInitialized, initialize } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth on mount
  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Show loading state while auth initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If Firebase is not configured, allow access (development mode)
  if (!isFirebaseAvailable()) {
    return <>{children}</>;
  }

  // If not logged in, show login prompt
  if (!user) {
    const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={loginUrl} className="block">
              <Button className="w-full" size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href={`/signup?redirect=${encodeURIComponent(pathname)}`}
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in, render children
  return <>{children}</>;
}
