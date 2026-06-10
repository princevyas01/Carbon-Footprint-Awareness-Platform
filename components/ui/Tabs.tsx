'use client';

import React, { useRef } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = -1;

    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (targetIndex !== -1) {
      const targetTab = tabs[targetIndex];
      onChange(targetTab.id);
      tabRefs.current[targetTab.id]?.focus();
    }
  };

  return (
    <div
      className="flex border-b border-border bg-white/5 p-1 rounded-xl gap-1 overflow-x-auto"
      role="tablist"
      aria-label="Tabs navigation"
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] md:text-xs font-display font-semibold rounded-lg transition-all whitespace-nowrap flex-1 ${
              isActive
                ? 'bg-space text-green shadow border border-border/20'
                : 'text-muted hover:text-frost hover:bg-white/5'
            }`}
          >
            {tab.icon && <span role="img" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
