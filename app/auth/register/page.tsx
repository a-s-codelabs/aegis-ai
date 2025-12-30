'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !phoneNumber.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          password: password.trim(),
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
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
        description: 'Account created successfully!',
      });

      // Redirect to home
      router.push('/home');
    } catch (error) {
      toast({
        title: 'Registration Failed',
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
      {/* Background layers */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-[#111827] to-[#020617]" />
      <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-full bg-linear-to-br from-teal-900/10 to-transparent opacity-50" />
      <div
        className="absolute inset-0 bg-[url('https://placeholder.pics/svg/20')] bg-repeat opacity-[0.03]"
        style={{ backgroundSize: '24px 24px', filter: 'invert(1)' }}
      />

      <div className="relative z-10 flex h-full min-h-screen flex-1 flex-col items-center overflow-y-auto px-6 py-8">
        {/* Back Button */}
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

        {/* Header Section */}
        <div className="mb-8 mt-4 flex w-full max-w-md flex-col items-center justify-center">
          <div className="relative mb-6 group">
            {/* Glow effect */}
            <div className="absolute inset-0 scale-110 animate-pulse rounded-full bg-teal-500/20 blur-2xl" />
            {/* Icon container */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-700/50 bg-linear-to-br from-slate-800 to-slate-900 shadow-xl shadow-black/40 backdrop-blur-md">
              <div className="pointer-events-none absolute inset-2 rounded-2xl border border-white/5" />
              <span
                className="material-symbols-outlined text-[40px] text-[#26d9bb] drop-shadow-[0_0_10px_rgba(45,212,191,0.4)]"
                style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
              >
                shield_lock
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
              Create Account
            </h1>
            <p className="text-sm font-medium tracking-wide text-slate-400">
              Register for Aegis AI protection
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="mb-4 flex w-full max-w-sm flex-1 flex-col justify-center space-y-6">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="ml-1 block text-xs font-bold uppercase tracking-wider text-[#c3cdd9]">
                Name
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-[20px] text-slate-500 transition-colors group-focus-within:text-[#26d9bb]">
                    person
                  </span>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-3.5 pl-11 pr-4 font-medium text-slate-100 placeholder-slate-500 transition-all focus:border-[#26d9bb] focus:outline-none focus:ring-1 focus:ring-[#26d9bb] sm:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="ml-1 block text-xs font-bold uppercase tracking-wider text-[#c3cdd9]">
                Phone Number
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-[20px] text-slate-500 transition-colors group-focus-within:text-[#26d9bb]">
                    call
                  </span>
                </div>
                <input
                  id="phoneNumber"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-3.5 pl-11 pr-4 font-medium text-slate-100 placeholder-slate-500 transition-all focus:border-[#26d9bb] focus:outline-none focus:ring-1 focus:ring-[#26d9bb] sm:text-sm"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="ml-1 block text-xs font-bold uppercase tracking-wider text-[#c3cdd9]">
                Password
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-[20px] text-slate-500 transition-colors group-focus-within:text-[#26d9bb]">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-3.5 pl-11 pr-12 font-medium text-slate-100 placeholder-slate-500 transition-all focus:border-[#26d9bb] focus:outline-none focus:ring-1 focus:ring-[#26d9bb] sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-600 transition-colors hover:text-slate-300"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="ml-1 block text-xs font-bold uppercase tracking-wider text-[#c3cdd9]">
                Confirm Password
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-[20px] text-slate-500 transition-colors group-focus-within:text-[#26d9bb]">
                    lock_reset
                  </span>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-3.5 pl-11 pr-4 font-medium text-slate-100 placeholder-slate-500 transition-all focus:border-[#26d9bb] focus:outline-none focus:ring-1 focus:ring-[#26d9bb] sm:text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="h-2" />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-[#26d9bb] px-5 text-[17px] font-bold leading-normal tracking-wide text-slate-900 shadow-lg shadow-teal-900/30 transition-all hover:bg-teal-300 active:scale-95 disabled:opacity-50"
            >
              <span className="mr-2">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </span>
              {!isLoading && (
                <span
                  className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5"
                  style={{ fontVariationSettings: '"wght" 600' }}
                >
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-block text-[15px] font-medium text-slate-400 transition-colors hover:text-white"
            >
              Already have an account?{' '}
              <span className="text-[#26d9bb] underline decoration-[#26d9bb]/30 underline-offset-4 transition-colors hover:decoration-[#26d9bb]">
                Log In
              </span>
            </Link>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto flex w-full flex-col items-center gap-3 pt-4">
          <div className="h-px w-12 bg-slate-700/50" />
          <div className="flex cursor-default items-center gap-2 opacity-50 transition-opacity hover:opacity-100">
            <span
              className="material-symbols-outlined text-sm text-[#26d9bb]"
              style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
            >
              verified_user
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Powered by Google AI &amp; Eleven Labs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
