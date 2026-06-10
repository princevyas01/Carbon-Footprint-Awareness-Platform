'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Trophy, LineChart, Leaf, Plus, User as UserIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { useCarbon } from '../../context/CarbonContext';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/log', label: 'Log Activity', icon: ClipboardList },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/insights', label: 'Insights', icon: LineChart },
  { href: '/offset', label: 'Offset', icon: Leaf },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const { state, switchUser } = useCarbon();

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside 
        className="hidden md:flex flex-col fixed left-0 top-[var(--banner-height)] h-[calc(100vh-var(--banner-height))] w-[240px] bg-space/60 dark:bg-space/40 backdrop-blur-lg border-r border-border p-6 z-40"
        aria-label="Main Navigation Sidebar"
      >
        {/* Brand Logo */}
        <div className="mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-frost hover:opacity-90 flex items-center gap-2">
            <span role="img" aria-label="Earth">🌍</span>
            <span>CarbonLens</span>
          </Link>
          <p className="text-[11px] text-muted font-body mt-1 uppercase tracking-wider">
            India Carbon Footprint
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2" aria-label="Main navigation menu">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-body text-sm ${
                  isActive
                    ? 'bg-green/10 text-green font-semibold border-l-4 border-green'
                    : 'text-muted hover:text-frost hover:bg-white/5 border-l-4 border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-green' : 'text-muted'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Active User Section */}
        {state.activeUser && (
          <div className="border-t border-border pt-4 mb-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label="User Avatar">{state.activeUser.avatar}</span>
              <div className="flex flex-col min-w-0">
                <span className="font-display font-bold text-sm text-frost truncate">
                  {state.activeUser.name}
                </span>
                <span className="text-[10px] font-display font-semibold text-[#00FF87] bg-[#00FF87]/5 border border-[#00FF87]/20 px-1.5 py-0.5 rounded-full w-fit mt-0.5">
                  {state.activeUser.level}
                </span>
              </div>
            </div>
            <button
              onClick={switchUser}
              className="w-full text-left text-xs font-body font-semibold text-[#8899AA] hover:text-[#00FF87] transition-colors mt-1"
            >
              Switch User ⇄
            </button>
          </div>
        )}

        {/* Sidebar Footer Controls */}
        <div className="border-t border-border pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
          </div>
          <span className="text-[10px] text-muted font-data uppercase tracking-wider">
            v1.0.0
          </span>
        </div>
      </aside>

      {/* Mobile Top Header Bar */}
      <header 
        className="md:hidden fixed top-[var(--banner-height)] left-0 right-0 h-16 bg-space/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-40"
        aria-label="Mobile brand header"
      >
        <Link href="/" className="font-display text-xl font-bold text-frost flex items-center gap-1.5">
          <span role="img" aria-label="Earth">🌍</span>
          <span>CarbonLens</span>
        </Link>
        <div className="flex items-center gap-2">
          {state.activeUser && (
            <Link
              href="/profile"
              className="text-xl mr-2 hover:scale-105 active:scale-95 transition-transform"
              title="Go to Profile Settings"
              aria-label="Profile Settings"
            >
              {state.activeUser.avatar}
            </Link>
          )}
          <ThemeToggle />
          <NotificationBell />
        </div>
      </header>

      {/* Mobile Bottom Navigation Tab Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2"
        style={{
          height: '64px',
          paddingBottom: 'calc(env(safe-area-inset-bottom) / 2)',
          background: 'rgba(13, 17, 23, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        aria-label="Mobile bottom tab navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.href === '/log') {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
                aria-label="Open Log Activity"
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className="flex items-center justify-center rounded-full transition-transform active:scale-95 duration-200"
                  style={{
                    width: '52px',
                    height: '52px',
                    transform: 'translateY(-12px)',
                    backgroundColor: '#00FF87',
                    color: '#080B12',
                    boxShadow: '0 4px 14px rgba(0, 255, 135, 0.4)',
                  }}
                >
                  <Plus className="h-6 w-6 stroke-[3px]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-body transition-colors"
              style={{ color: isActive ? '#00FF87' : '#8899AA' }}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span 
                  className="absolute top-1.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: '#00FF87' }}
                />
              )}
              <Icon 
                className="h-5 w-5 mb-0.5" 
                style={{ color: isActive ? '#00FF87' : '#8899AA' }}
              />
              <span className="truncate max-w-[70px]" style={{ fontWeight: isActive ? 600 : 400 }}>
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
