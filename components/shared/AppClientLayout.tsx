'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SplashScreen from './SplashScreen';
import Navbar from './Navbar';
import SkipToContent from './SkipToContent';
import ParticleCanvas from './ParticleCanvas';
import Toast from '../ui/Toast';
import LevelUpModal from '../gamification/LevelUpModal';
import CompletionCelebration from '../challenges/CompletionCelebration';
import { useCarbon } from '../../context/CarbonContext';
import { storage } from '../../lib/storage';

export default function AppClientLayout({ children }: { children: React.ReactNode }) {
  const { state, removeToast } = useCarbon();
  const [showSplash, setShowSplash] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // Read session storage to see if we already showed splash in this session
    const splashShown = sessionStorage.getItem('carbonlens_session_splash_shown');
    if (splashShown === 'true') {
      setShowSplash(false);
    }

    // Check banner dismissal status
    const dismissed = localStorage.getItem('carbonlens_multiplier_banner_dismissed');
    if (dismissed !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('carbonlens_session_splash_shown', 'true');
  };

  // Perform route protection / onboarding redirect
  useEffect(() => {
    if (isMounted && !showSplash) {
      const onboarded = storage.getOnboarded();
      if (!onboarded && pathname !== '/onboarding') {
        router.push('/onboarding');
      } else if (onboarded && pathname === '/onboarding') {
        router.push('/');
      }
    }
  }, [isMounted, showSplash, pathname, router]);

  if (!isMounted) {
    // Return empty page shell during SSR/hydration to avoid hydration mismatch
    return (
      <div className="min-h-screen bg-[#080B12] text-[#E8F4F1] flex items-center justify-center font-display text-2xl font-bold">
        Loading CarbonLens...
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Determine if it's the onboarding page to hide navigation sidebar
  const isOnboarding = pathname === '/onboarding';

  return (
    <div className="min-h-screen flex flex-col relative">
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --banner-height: ${showBanner ? '32px' : '0px'};
        }
      `}} />

      {showBanner && (
        <div 
          className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center font-display text-[10px] sm:text-xs font-bold px-4 text-[#080B12] select-none shadow-md"
          style={{
            height: '32px',
            background: 'linear-gradient(90deg, #00FF87, #00E1D9)',
            borderBottom: '1px solid rgba(8, 11, 18, 0.15)',
          }}
        >
          <span className="truncate">
            ⚡ ECO SCORE MULTIPLIER ACTIVE: Log your first green transit today to double your daily score!
          </span>
          <button 
            onClick={() => {
              localStorage.setItem('carbonlens_multiplier_banner_dismissed', 'true');
              setShowBanner(false);
            }}
            className="ml-3 shrink-0 underline hover:opacity-85 transition-opacity font-bold"
            aria-label="Dismiss banner"
          >
            [Dismiss]
          </button>
        </div>
      )}

      <div className="min-h-screen flex flex-col md:flex-row relative pt-[var(--banner-height)]">
        <SkipToContent />
        <ParticleCanvas />

        {/* Render navigation bar only if not on onboarding page */}
        {!isOnboarding && <Navbar />}

        {/* Main content grid */}
        <main
          id="main-content"
          className={`flex-1 w-full relative z-10 min-h-screen flex flex-col ${
            isOnboarding
              ? 'p-4 md:p-8 max-w-4xl mx-auto justify-center'
              : 'md:pl-[240px] pt-[calc(64px+16px)] md:pt-8 pb-24 md:pb-8 px-4 md:px-8 max-w-7xl mx-auto'
          }`}
        >
          <div className="flex-1 animate-fade-in-up">{children}</div>
        </main>

        {/* Portal overlays */}
        <LevelUpModal />
        <CompletionCelebration />

        {/* Toasts Stack */}
        <div 
          className="fixed bottom-20 md:bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4"
          aria-live="polite"
        >
          {state.toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    </div>
  );
}
