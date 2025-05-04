
'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthContext } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator'; // Import Separator

// Inline SVG for Google icon
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
    <path fill="#EA4335" d="M24 9.5c3.46 0 6.38 1.19 8.64 3.28l6.4-6.4C34.86 2.48 29.88 0 24 0 14.7 0 6.85 5.62 2.76 13.74l7.88 6.1C12.23 13.5 17.64 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.7 24.39c0-1.66-.15-3.28-.43-4.85H24v9.1h12.77c-.55 2.95-2.18 5.44-4.66 7.14l7.3 5.68C43.93 37.64 46.7 31.64 46.7 24.39z"/>
    <path fill="#FBBC05" d="M10.64 28.1c-.6-1.79-.94-3.7-.94-5.7s.34-3.91.94-5.7L2.76 10.6C1.03 14.07 0 18.19 0 22.4s1.03 8.33 2.76 11.8l7.88-6.1z"/>
    <path fill="#34A853" d="M24 48c5.88 0 10.86-1.95 14.48-5.28l-7.3-5.68c-1.95 1.31-4.45 2.09-7.18 2.09-6.36 0-11.77-4-13.67-9.4l-7.88 6.1C6.85 42.38 14.7 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Separate loading state for Google
  const [error, setError] = useState<string | null>(null);
  const { user, loading, login, loginWithGoogle } = useContext(AuthContext); // Get loginWithGoogle
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      // Redirect is handled by the effect watching the user state
    } catch (err: any) {
        console.error("Detailed Login Error:", err);
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                 setError('Invalid email or password. Please try again.');
                 break;
            case 'auth/invalid-email':
                setError('Please enter a valid email address.');
                break;
             case 'auth/too-many-requests':
                setError('Too many login attempts. Please try again later.');
                break;
            default:
                setError('An unexpected error occurred during login. Please try again.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
       // Redirect is handled by the effect watching the user state
    } catch (err: any) {
        console.error("Detailed Google Login Error:", err);
        if (err.code !== 'auth/popup-closed-by-user') { // Don't show error if user closed popup
          setError('Failed to sign in with Google. Please try again.');
        }
    } finally {
      setIsGoogleLoading(false);
    }
  };


  // Show loading indicator while checking auth state or if already logged in
  // or during Google sign-in process
  if (loading || (!loading && user) || isGoogleLoading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account or use Google.</CardDescription>
        </CardHeader>
        <CardContent>
           {error && (
             <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        {...field}
                        disabled={isLoading || isGoogleLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                       <Input
                         id="password"
                         type="password"
                         required
                         {...field}
                         disabled={isLoading || isGoogleLoading}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>

           <Separator className="my-4" />

            <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
            >
                {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>

              {/* Optional: Add links for signup or password reset if needed later */}
              {/* <div className="mt-4 text-center text-sm">
                Don't have an account?{' '}
                <a href="#" className="underline">
                  Sign up
                </a>
              </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
