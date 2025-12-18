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
  const [showPassword, setShowPassword] = useState(false);

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
          })
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
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-primary font-display text-slate-100">
      {/* Background layers to match provided design */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#111827] to-[#020617]" />
      <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-full bg-gradient-to-br from-teal-900/10 to-transparent opacity-50" />
      <div
        className="absolute inset-0 bg-[url('https://placeholder.pics/svg/20')] bg-repeat opacity-[0.03]"
        style={{ backgroundSize: '24px 24px', filter: 'invert(1)' }}
      />

      <div className="relative z-10 flex h-full min-h-screen flex-1 flex-col px-6 pb-8 pt-12">
        <div className="mb-8 flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-400 transition-colors hover:bg-slate-700/50"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <div className="w-10" />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          <div className="mb-10 text-center">
            <div className="mb-6 flex items-center gap-3 justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-black/20">
                <span
                  className="material-symbols-outlined text-2xl text-[#26d9bb]"
                  style={{
                    fontVariationSettings: '"FILL" 1, "wght" 600',
                  }}
                >
                  shield_lock
                </span>
              </div>
            </div>

            <h1 className="mb-2 text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-base text-slate-400">
              Please enter your phone number to sign in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="phoneNumber"
                  className="ml-1 block text-sm font-medium text-[#c3cdd9]"
                >
                  Phone Number
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="material-symbols-outlined text-slate-500 transition-colors group-focus-within:text-[#26d9bb]">
                      call
                    </span>
                  </div>
                  <input
                    id="phoneNumber"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="block w-full rounded-2xl border-0 bg-slate-800/50 py-4 pl-12 pr-4 text-slate-100 ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 transition-all focus:bg-slate-800 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="ml-1 block text-sm font-medium text-[#c3cdd9]"
                >
                  Password
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="material-symbols-outlined text-slate-500 transition-colors group-focus-within:text-[#26d9bb]">
                      lock
                    </span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="block w-full rounded-2xl border-0 bg-slate-800/50 py-4 pl-12 pr-12 text-slate-100 ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 transition-all focus:bg-slate-800 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <button
                      type="button"
                      className="text-slate-500 transition-colors hover:text-slate-300 focus:outline-none"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    className="text-sm font-medium text-[#26d9bb] transition-colors hover:text-teal-300"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-[#26d9bb] px-5 text-[17px] font-bold leading-normal tracking-wide text-slate-900 shadow-lg shadow-teal-900/30 transition-all hover:bg-teal-300 active:scale-95"
              >
                Log In
              </button>
            </div>
          </form>

          <div className="mt-auto pb-4 pt-8 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?
              <Link
                href="/register"
                className="ml-1 font-bold text-[#26d9bb] transition-colors hover:text-teal-300"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
            <span
              className="material-symbols-outlined text-sm text-[#26d9bb]"
              style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
            >
              verified_user
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Secure Log In
            </p>
          </div>
        </div>
      </div>

      {/*
        Previous implementation kept for reference. Commented out to avoid deleting user code.
        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-10 pt-16">
          <Card className="w-full max-w-md border border-teal-400/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950/95 px-6 py-8 shadow-[0_40px_120px_rgba(15,23,42,0.9)]">
            ...
          </Card>
        </main>
      */}
    </div>
  );
}
