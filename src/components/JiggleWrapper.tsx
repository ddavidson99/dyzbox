"use client";

import React, { useState, useEffect } from 'react';
import { useAnimation } from '@/contexts/AnimationContext';

interface JiggleWrapperProps {
  children: React.ReactNode;
  index: number;
  unreadCount: number;
  totalItems: number;
}

export default function JiggleWrapper({ 
  children, 
  index, 
  unreadCount, 
  totalItems 
}: JiggleWrapperProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { currentMinute, animationTimestamp } = useAnimation();
  
  useEffect(() => {
    // Only animate if there are unread items
    if (unreadCount <= 0) return;
    
    // Calculate staggered start time based on index
    // Distribute animations evenly across the minute
    const staggerDelay = Math.floor((index / totalItems) * 45); // Max 45s delay to avoid overlap
    
    // Start the animation after the staggered delay
    const animationTimer = setTimeout(() => {
      setIsAnimating(true);
      
      // End the animation after 1 second
      const endTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      
      return () => clearTimeout(endTimer);
    }, staggerDelay * 1000);
    
    return () => clearTimeout(animationTimer);
  }, [currentMinute, animationTimestamp, index, unreadCount, totalItems]);

  // Apply animation style directly to the wrapper div
  return (
    <div
      style={{ 
        display: 'inline-block',
        animation: isAnimating ? 'jiggle 1s ease' : 'none',
        willChange: unreadCount > 0 ? 'transform' : 'auto'
      }}
    >
      {children}
    </div>
  );
} 