'use client';

import * as React from 'react';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function MobileModal({
  open,
  onOpenChange,
  children,
  className,
}: MobileModalProps) {
  if (!open) return null;

  return (
    <>
      {/* Overlay - positioned absolutely within iPhone container */}
      <div
        className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal Content - positioned absolutely within iPhone container */}
      <div
        className={cn(
          'absolute inset-0 z-50 flex items-center justify-center p-4',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            'relative w-full max-w-[calc(100%-2rem)] bg-[#151e32] border border-gray-800 rounded-xl shadow-lg p-6 animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {children}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26d9bb] disabled:pointer-events-none"
          >
            <XIcon className="h-4 w-4 text-gray-400" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </>
  );
}

