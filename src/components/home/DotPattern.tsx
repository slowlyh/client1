'use client';

interface DotPatternProps {
  className?: string;
}

export function DotPattern({ className }: DotPatternProps) {
  return (
    <div className={`absolute inset-0 z-0 h-full w-full pointer-events-none ${className || ''}`}>
      <svg
        className="absolute h-full w-full text-neutral-200 dark:text-neutral-900"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="dot-pattern"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
            patternTransform="translate(0 0)"
          >
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>
    </div>
  );
}
