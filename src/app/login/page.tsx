
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading, login } = useContext(AuthContext);
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
      // router.push('/'); // No need to push here, effect handles it
    } catch (err: any) {
        // Log the full error object for detailed debugging
        console.error("Detailed Login Error:", err);
        // Provide more user-friendly messages based on Firebase error codes
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                setError('Invalid email or password. Please try again.');
                break;
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

  // Show loading indicator while checking auth state or if already logged in
  if (loading || (!loading && user)) {
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
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                 </Alert>
              )}
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
                        disabled={isLoading}
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
                         disabled={isLoading}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              {/* Optional: Add links for signup or password reset if needed later */}
              {/* <div className="mt-4 text-center text-sm">
                Don't have an account?{' '}
                <a href="#" className="underline">
                  Sign up
                </a>
              </div> */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
