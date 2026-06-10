import React from 'react';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-white/5 rounded-xl animate-shimmer shimmer-bg border border-border/20 ${className}`}
      aria-hidden="true"
    />
  );
}
