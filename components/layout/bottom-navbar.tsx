'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { path: '/home', icon: 'home', label: 'Home' },
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/manage', icon: 'manage_accounts', label: 'Manage' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#151e32]/95 backdrop-blur-lg border-t border-gray-800 pb-safe pt-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center px-2 pb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 transition-colors group ${
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

