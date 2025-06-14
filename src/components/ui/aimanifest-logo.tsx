import React from 'react';

interface AimanifestLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

const AimanifestLogo: React.FC<AimanifestLogoProps> = ({ 
  size = 32, 
  showText = false, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="url(#gradient)" />
        <path
          d="M8 12L16 8L24 12V20L16 24L8 20V12Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="16" cy="16" r="3" fill="white" />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <span className="text-xl font-bold text-gray-900">
          AIMANIFEST
        </span>
      )}
    </div>
  );
};

export default AimanifestLogo;