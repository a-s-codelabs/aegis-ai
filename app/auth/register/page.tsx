'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { MobileModal } from '@/components/ui/mobile-modal';
import { Button } from '@/components/ui/button';

// Register Content Component (to be rendered inside iPhone)
function RegisterContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionsPopup, setShowPermissionsPopup] = useState(false);
  const [contactAccessGranted, setContactAccessGranted] = useState(false);
  const [aiCallDiversionGranted, setAiCallDiversionGranted] = useState(false);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
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
        // Handle 409 Conflict (user already exists)
        if (response.status === 409) {
          throw new Error(data.error || 'This phone number is already registered. Please log in instead.');
        }
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

      // Mark user as newly registered
      if (typeof window !== 'undefined') {
        localStorage.setItem('isNewUser', 'true');
      }

      // Show permissions popup
      setShowPermissionsPopup(true);
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
  }, [name, phoneNumber, password, confirmPassword, toast, router]);

  // Handle permissions popup actions
  const handlePermissionsContinue = () => {
    // Save permissions to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('contactAccessEnabled', String(contactAccessGranted));
      localStorage.setItem('divertCallPopupEnabled', String(aiCallDiversionGranted));
      
      // If contact access is granted, seed dummy contacts immediately
      if (contactAccessGranted) {
        // Import and call seedDummyContacts
        import('@/lib/utils/contacts').then(({ seedDummyContacts }) => {
          seedDummyContacts();
        });
      }
      
      // Dispatch events to notify other components
      window.dispatchEvent(new Event('contactAccessChanged'));
      window.dispatchEvent(new Event('divertCallPopupChanged'));
    }

    // Close popup and redirect to home
    setShowPermissionsPopup(false);
    router.push('/home');
  };
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-primary font-display text-slate-100">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#111827] to-[#020617]" />
        <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-full bg-gradient-to-br from-teal-900/10 to-transparent opacity-50" />
        <div
          className="absolute inset-0 bg-[url('https://placeholder.pics/svg/20')] bg-repeat opacity-[0.03]"
          style={{ backgroundSize: '24px 24px', filter: 'invert(1)' }}
        />

        <div className="relative z-10 flex h-full min-h-screen flex-1 flex-col items-center overflow-y-auto px-6 py-8 hide-scrollbar">
          {/* Back Button */}
          <div className="mb-2 flex w-full items-center justify-between">
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
          <div className="mb-6 mt-0 flex w-full max-w-md flex-col items-center justify-center">
            <div className="relative mb-4 group">
              {/* Glow effect */}
              <div className="absolute inset-0 scale-110 animate-pulse rounded-full bg-teal-500/20 blur-2xl" />
              {/* Icon container */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl shadow-black/40 backdrop-blur-md">
                <div className="pointer-events-none absolute inset-2 rounded-2xl border border-white/5" />
                <span
                  className="material-symbols-outlined text-[40px] text-[#26d9bb] drop-shadow-[0_0_10px_rgba(45,212,191,0.4)]"
                  style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
                >
                  shield_lock
                </span>
              </div>
            </div>

            <div className="space-y-2 text-center mb-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                Create Account
              </h1>
              <p className="text-sm font-medium tracking-wide text-slate-400">
                Register for Aegis AI protection
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="mb-4 flex w-full max-w-sm flex-1 flex-col space-y-6">
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
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-3.5 pl-11 pr-12 font-medium text-slate-100 placeholder-slate-500 transition-all focus:border-[#26d9bb] focus:outline-none focus:ring-1 focus:ring-[#26d9bb] sm:text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-600 transition-colors hover:text-slate-300"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

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

        {/* Permissions Popup Modal */}
        <MobileModal
          open={showPermissionsPopup}
          onOpenChange={setShowPermissionsPopup}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Enable Permissions</h2>
              <p className="text-sm text-gray-400">
                Grant permissions to enhance your Aegis AI experience
              </p>
            </div>

            {/* Contact Access Permission */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50">
                    <span className="material-symbols-outlined text-[#26d9bb]">
                      contacts
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Contact Access</h3>
                    <p className="text-xs text-gray-400">
                      Access your contacts to identify callers
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setContactAccessGranted((prev) => !prev)}
                  className={`w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                    contactAccessGranted
                      ? 'bg-[#26d9bb]'
                      : 'bg-gray-600'
                  } relative`}
                  aria-label={contactAccessGranted ? 'Disable contact access' : 'Enable contact access'}
                  role="switch"
                  aria-checked={contactAccessGranted}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                      contactAccessGranted ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* AI Call Diversion Permission */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50">
                    <span className="material-symbols-outlined text-[#26d9bb]">
                      shield
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">AI Call Diversion</h3>
                    <p className="text-xs text-gray-400">
                      Show popup to divert suspicious calls to AI
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiCallDiversionGranted((prev) => !prev)}
                  className={`w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                    aiCallDiversionGranted
                      ? 'bg-[#26d9bb]'
                      : 'bg-gray-600'
                  } relative`}
                  aria-label={aiCallDiversionGranted ? 'Disable AI call diversion' : 'Enable AI call diversion'}
                  role="switch"
                  aria-checked={aiCallDiversionGranted}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md ${
                      aiCallDiversionGranted ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handlePermissionsContinue}
              className="w-full h-12 bg-[#26d9bb] text-slate-900 font-bold hover:bg-teal-300"
            >
              Continue
            </Button>
          </div>
        </MobileModal>
      </div>
    );
}

export default function RegisterPage() {
  // Prepare left content (instructions)
  const leftContent = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#26d9bb] mb-4">
        Create Your Account
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Join Aegis AI to start protecting yourself from fraudulent calls. Create your account in just a few simple steps.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            person_add
          </span>
          <div>
            <strong className="text-[#26d9bb]">Account Setup:</strong> Provide your name and phone number to create your account. Your phone number will be used as your unique identifier.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            lock
          </span>
          <div>
            <strong className="text-[#26d9bb]">Secure Password:</strong> Create a strong password with at least 6 characters. Make sure to confirm your password correctly to avoid any issues.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            visibility
          </span>
          <div>
            <strong className="text-[#26d9bb]">Password Visibility:</strong> Use the eye icon to toggle password visibility while typing. This helps ensure you enter your password correctly.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            check_circle
          </span>
          <div>
            <strong className="text-[#26d9bb]">Already Registered?</strong> If you already have an account, click "Log In" at the bottom to sign in instead.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={<RegisterContent />}
      leftBasis="60%"
    />
  );
}
