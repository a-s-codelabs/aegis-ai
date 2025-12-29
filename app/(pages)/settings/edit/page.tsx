'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
  profilePicture?: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) {
        router.push('/auth/login');
        return;
      }

      try {
        const session: UserSession = JSON.parse(sessionData);
        setUserSession(session);
        setName(session.name || '');
        setPhoneNumber(session.phoneNumber || '');
        setProfilePicture(session.profilePicture || null);
        
        // Fetch current profile from API
        fetchProfile(session.userId);
      } catch (error) {
        console.error('[Edit Profile] Error parsing session:', error);
        router.push('/auth/login');
      }
    }
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setName(data.profile.name || '');
        setPhoneNumber(data.profile.phoneNumber || '');
        setProfilePicture(data.profile.profilePicture || null);
      }
    } catch (error) {
      console.error('[Edit Profile] Error fetching profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePicture(base64String);
    };
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to read image file',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!userSession) return;

    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Phone number is required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userSession.userId,
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          profilePicture: profilePicture,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update localStorage
      if (typeof window !== 'undefined') {
        const updatedSession: UserSession = {
          ...userSession,
          name: data.profile.name,
          phoneNumber: data.profile.phoneNumber,
          profilePicture: data.profile.profilePicture,
        };
        localStorage.setItem('userSession', JSON.stringify(updatedSession));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('profileUpdated'));
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      // Navigate back to settings
      router.push('/settings');
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/settings');
  };

  // Get user initials from name or phone number
  const getUserInitials = () => {
    if (name) {
      const names = name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return phoneNumber?.slice(-1) || 'U';
  };

  // Edit Profile Content Component (to be rendered inside iPhone)
  function EditProfileContent() {
    if (isLoadingProfile) {
      return (
        <AppLayout fullWidth>
          <div className="flex flex-col min-h-full items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        </AppLayout>
      );
    }

    return (
      <AppLayout fullWidth>
        <div className="flex flex-col min-h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              aria-label="Cancel"
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: '"FILL" 0, "wght" 400' }}
              >
                arrow_back
              </span>
            </button>
            <h1 className="text-xl font-semibold text-white flex-1 text-center">Edit Profile</h1>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="text-[#26d9bb] hover:text-[#20c4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex-shrink-0"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Profile Picture Section */}
          <section className="w-full flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {profilePicture ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-700/50">
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#1e293b] flex items-center justify-center border-2 border-gray-700/50">
                  <span className="text-4xl font-semibold text-white">
                    {getUserInitials()}
                  </span>
                </div>
              )}
              
              {/* Edit Icon Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#26d9bb] flex items-center justify-center border-2 border-[#0B1121] hover:bg-[#20c4a8] transition-colors shadow-lg z-10"
                aria-label="Change profile picture"
              >
                <span
                  className="material-symbols-outlined text-white text-lg leading-none"
                  style={{ fontVariationSettings: '"FILL" 0, "wght" 500' }}
                >
                  {profilePicture ? 'edit' : 'add_photo_alternate'}
                </span>
              </button>

              {/* Remove Image Button */}
              {profilePicture && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center border-2 border-[#0B1121] hover:bg-red-600 transition-colors shadow-lg z-10"
                  aria-label="Remove profile picture"
                >
                  <span
                    className="material-symbols-outlined text-white text-sm leading-none"
                    style={{ fontVariationSettings: '"FILL" 0, "wght" 500' }}
                  >
                    close
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Upload profile picture"
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              Tap to change profile picture
            </p>
          </section>

          {/* Form Fields */}
          <section className="w-full space-y-4 flex-1">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-[#151e32] border border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#26d9bb] focus:border-transparent"
              />
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-300">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3 rounded-xl bg-[#151e32] border border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#26d9bb] focus:border-transparent"
              />
            </div>
          </section>

          {/* Save Button at Bottom */}
          <div className="mt-auto pt-6">
            <button
              onClick={handleSave}
              disabled={isLoading || !name.trim() || !phoneNumber.trim()}
              className="w-full py-3 rounded-xl bg-[#26d9bb] text-white font-semibold hover:bg-[#20c4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Prepare left content (instructions)
  const leftContent = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#26d9bb] mb-4">
        Edit Profile
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Update your profile information. Change your name, phone number, or profile picture.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            person
          </span>
          <div>
            <strong className="text-[#26d9bb]">Name:</strong> Update your display name that appears in the app.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            phone
          </span>
          <div>
            <strong className="text-[#26d9bb]">Phone Number:</strong> Update your contact phone number.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            image
          </span>
          <div>
            <strong className="text-[#26d9bb]">Profile Picture:</strong> Upload a new profile picture or remove the current one.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={<EditProfileContent />}
      leftBasis="60%"
    />
  );
}

