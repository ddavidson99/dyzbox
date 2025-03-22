"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AnimationContextType {
  currentMinute: number;
  animationTimestamp: number;
}

const AnimationContext = createContext<AnimationContextType>({
  currentMinute: 0,
  animationTimestamp: 0
});

export const useAnimation = () => useContext(AnimationContext);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [animationTimestamp, setAnimationTimestamp] = useState<number>(0);

  useEffect(() => {
    // Initialize current minute
    const now = new Date();
    setCurrentMinute(now.getMinutes());
    setAnimationTimestamp(Date.now());

    // Update minute counter every 60 seconds
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinute(now.getMinutes());
      setAnimationTimestamp(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimationContext.Provider value={{ currentMinute, animationTimestamp }}>
      {children}
    </AnimationContext.Provider>
  );
} 