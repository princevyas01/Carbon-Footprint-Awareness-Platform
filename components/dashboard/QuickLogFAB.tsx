'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';

const LogModal = dynamic(() => import('../logger/LogModal'), { ssr: false });

export default function QuickLogFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 p-4 bg-green hover:bg-green-dim text-void rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Quick Log Activity"
        title="Quick Log Activity"
      >
        <Plus className="h-6 w-6 text-void transition-transform group-hover:rotate-90" />
      </button>

      {isOpen && <LogModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
}
