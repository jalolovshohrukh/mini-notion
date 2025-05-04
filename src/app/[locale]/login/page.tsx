
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
import { LanguageSwitcher } from '@/components/LanguageSwitcher'; // Import LanguageSwitcher
import { useI18n, useCurrentLocale } from '@/i18n/client'; // Import i18n hooks

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }), // Keep validation messages in English or create dynamic ones
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading, login } = useContext(AuthContext);
  const router = useRouter();
  const t = useI18n(); // Initialize i18n hook
  const currentLocale = useCurrentLocale(); // Get current locale

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
      router.push(`/${currentLocale}`); // Redirect to localized home page
    }
  }, [user, loading, router, currentLocale]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      // Redirect is handled by the effect watching the user state
    } catch (err: any) {
        console.error("Detailed Login Error:", err);
        // Use translated error messages
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                 setError(t('login.error.invalidCredentials'));
                 break;
            case 'auth/invalid-email':
                setError(t('login.error.invalidEmail'));
                break;
             case 'auth/too-many-requests':
                setError(t('login.error.tooManyRequests'));
                break;
            default:
                setError(t('login.error.generic'));
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
      <Card className="w-full max-w-sm shadow-lg relative"> {/* Added relative positioning */}
         {/* Language Switcher */}
         <div className="absolute top-4 right-4">
             <LanguageSwitcher />
         </div>
        <CardHeader>
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
           {error && (
             <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('login.failedTitle')}</AlertTitle>
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
                    <FormLabel>{t('login.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('login.emailPlaceholder')}
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
                     <FormLabel htmlFor="password">{t('login.passwordLabel')}</FormLabel>
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
                {isLoading ? t('login.loadingButton') : t('login.button')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
