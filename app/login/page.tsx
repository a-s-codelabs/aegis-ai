'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { Shield, LogIn, Phone, Lock } from 'lucide-react';
import { LogIn, Phone, Lock } from 'lucide-react';
import { ShieldLockLogo } from '@/components/brand-logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim() || !password.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both phone number and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user session
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'userSession',
          JSON.stringify({
            userId: data.userId,
            phoneNumber: data.phoneNumber,
            token: data.token,
          }),
        );
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      // Redirect to dashboard
      router.push('/user');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-foreground">
      {/* Background grid + glow for consistency with onboarding */}
      <div className="pointer-events-none absolute inset-0 bg-security-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-security-radial" />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-10 pt-16">
        <Card className="w-full max-w-md border border-teal-400/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950/95 px-6 py-8 shadow-[0_40px_120px_rgba(15,23,42,0.9)]">
          <div className="mb-8 text-left">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
            >
              <span className="sr-only">Go back</span>
              {/* simple arrow using pseudo text to avoid extra icon import */}
              <span className="-ml-px text-lg">{'←'}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-[0_0_40px_rgba(15,23,42,1)] ring-1 ring-white/5">
                <ShieldLockLogo size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-50">
                  Welcome Back
                </h1>
                <p className="mt-1 text-xs text-slate-300">
                  Please enter your phone number to sign in.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="text-xs font-semibold uppercase tracking-wide text-slate-300"
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 pl-10 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:ring-teal-400"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wide text-slate-300"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-2xl border border-slate-700/70 bg-slate-900/60 pl-10 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:ring-teal-400"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500" />
              <button
                type="button"
                className="font-semibold text-teal-300 hover:text-teal-200"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="mt-1 h-12 w-full rounded-full bg-teal-400 text-base font-semibold text-slate-950 shadow-[0_20px_60px_rgba(45,212,191,0.55)] hover:bg-teal-300"
              disabled={isLoading}
            >
              {isLoading ? (
                'Logging in...'
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Log In
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-teal-300 hover:text-teal-200"
            >
              Sign Up
            </Link>
          </div>

          <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
            Secure Log In
          </p>
        </Card>
      </main>
    </div>
  );
}
