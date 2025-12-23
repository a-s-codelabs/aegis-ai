'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { path: '/home', icon: 'home', label: 'Home' },
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/manage', icon: 'manage_accounts', label: 'Manage' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

interface BottomNavbarProps {
  isFullWidth?: boolean;
}

export function BottomNavbar({ isFullWidth = false }: BottomNavbarProps) {
  const pathname = usePathname();

  // Use absolute positioning when inside iPhone mockup (fullWidth), fixed otherwise
  const positionClasses = isFullWidth
    ? 'absolute bottom-0 left-0 right-0 w-full bg-[#151e32]/95 backdrop-blur-lg border-t border-gray-800 pt-2 z-50'
    : 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-[#151e32]/95 backdrop-blur-lg border-t border-gray-800 pb-safe pt-2 z-50';

  return (
    <nav className={positionClasses}>
      <div className="flex justify-around items-center px-2 pb-2">
        {navItems.map((item) => {
          // Dashboard is active for both /dashboard and /dashboard/admin
          const isActive =
            item.path === '/dashboard'
              ? pathname === '/dashboard' || pathname === '/dashboard/admin'
              : pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 transition-colors group relative ${
                isActive ? 'text-[#26d9bb]' : 'text-gray-500 hover:text-gray-200'
              }`}
            >
              <span
                className={`material-symbols-outlined text-2xl mb-1 group-hover:scale-110 transition-transform ${
                  isActive ? 'fill-1' : ''
                }`}
                style={
                  isActive
                    ? { fontVariationSettings: '"FILL" 1, "wght" 600' }
                    : { fontVariationSettings: '"wght" 400' }
                }
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && item.path === '/dashboard' && (
                <span className="absolute -top-1 right-3 w-2 h-2 rounded-full bg-[#26d9bb] animate-pulse shadow-[0_0_8px_rgba(38,217,187,0.5)]"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

