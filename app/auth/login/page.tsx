'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
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
            name: data.name,
            profilePicture: data.profilePicture || null,
            token: data.token,
          })
        );
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      // Redirect to dashboard
      router.push('/home');
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
  }, [phoneNumber, password, toast, router]);

  // Login Content Component (to be rendered inside iPhone)
  const LoginContent = (
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-primary font-display text-slate-100">
        {/* Background layers */}
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
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 scale-110 animate-pulse rounded-full bg-teal-500/20 blur-2xl" />
                  {/* Icon container */}
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl shadow-black/40 backdrop-blur-md">
                    <div className="pointer-events-none absolute inset-2 rounded-2xl border border-white/5" />
                    <span
                      className="material-symbols-outlined text-[40px] text-[#26d9bb] drop-shadow-[0_0_10px_rgba(45,212,191,0.4)]"
                      style={{
                        fontVariationSettings: '"FILL" 1, "wght" 600',
                      }}
                    >
                      shield_lock
                    </span>
                  </div>
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

            <div className="pt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?
                <Link
                  href="/auth/register"
                  className="ml-1 font-bold text-[#26d9bb] transition-colors hover:text-teal-300"
                >
                  Register
                </Link>
              </p>
            </div>

            <div className="mt-auto pt-8 flex items-center justify-center gap-2 opacity-50">
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
      </div>
    );

  // Prepare left content (instructions)
  const leftContent = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#26d9bb] mb-4">
        Welcome Back
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Sign in to your Aegis AI account to access AI-powered call protection and manage your security settings.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            login
          </span>
          <div>
            <strong className="text-[#26d9bb]">Secure Authentication:</strong> Use your phone number and password to securely access your account. All login attempts are encrypted and protected.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            phone_in_talk
          </span>
          <div>
            <strong className="text-[#26d9bb]">Phone Number Login:</strong> Your phone number serves as your unique identifier. Make sure to use the same number you registered with.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            lock
          </span>
          <div>
            <strong className="text-[#26d9bb]">Password Security:</strong> Keep your password secure and never share it. Use the eye icon to toggle password visibility while typing.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            help
          </span>
          <div>
            <strong className="text-[#26d9bb]">Need Help?</strong> If you forgot your password, click "Forgot Password?" to reset it. Don't have an account? Click "Register" to create one.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={LoginContent}
      leftBasis="60%"
    />
  );
}
