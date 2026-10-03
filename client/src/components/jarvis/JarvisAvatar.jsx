import React from 'react';

export const JarvisAvatar = ({ size = 'md', isThinking = false, isSpeaking = false, className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${sizeMap[size] || sizeMap.md} ${className}`}
      aria-label="JARVIS AI"
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 blur-[3px] transition-opacity duration-500 ${
          isThinking || isSpeaking ? 'opacity-100 animate-pulse' : 'opacity-60'
        }`}
      />

      {/* Orbiting ring */}
      <div
        className={`absolute inset-0 rounded-full border border-cyan-400/40 dark:border-cyan-300/40 ${
          isThinking ? 'animate-spin border-t-cyan-400 border-r-transparent' : ''
        }`}
        style={{ animationDuration: isThinking ? '2s' : '8s' }}
      />

      {/* Core capsule */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#0c162d] to-[#070b16] border border-cyan-500/50 flex items-center justify-center shadow-inner overflow-hidden">
        {/* Futuristic grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:6px_6px] opacity-25" />

        {/* Inner energy core */}
        <div
          className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-400 shadow-[0_0_8px_#38bdf8] transition-transform duration-300 ${
            isSpeaking ? 'scale-125 animate-ping' : isThinking ? 'scale-110 animate-pulse' : 'scale-100'
          }`}
        />

        {/* Micro indicator ring */}
        <span className="sr-only">JARVIS</span>
      </div>
    </div>
  );
};
