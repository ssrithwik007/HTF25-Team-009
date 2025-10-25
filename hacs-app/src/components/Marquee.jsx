import React from 'react';

// Reusable Marquee Component
export default function Marquee({ children, speed = 20, direction = 'left', pauseOnHover = false, className = '' }) {
  const animationDuration = `${speed}s`;
  const animationDirection = direction === 'left' ? 'marquee-left' : 'marquee-right';
  
  return (
    <div className={`overflow-hidden border-white ${className}`}>
      <div 
        className={`flex ${pauseOnHover ? 'hover:pause' : ''}`}
        style={{
          animation: `${animationDirection} ${animationDuration} linear infinite`,
        }}
      >
        <div className="flex shrink-0">
          {children}
          {children}
          {children}
          {children}
          {children}
          {children}
          {children}
          {children}
        </div>
        <div className="flex shrink-0">
          {children}
          {children}
          {children}
          {children}
          {children}
          {children}
          {children}
          {children}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marquee-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .hover\\:pause:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}