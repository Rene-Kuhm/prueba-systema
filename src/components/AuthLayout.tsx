import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AuthLayout({ children, title = 'COSPEC' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Rotating Gradient Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 opacity-30"
            style={{
              transform: `rotate(${i * 72}deg)`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <div className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12 relative">
            <div className="inline-block">
              <h1
                className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 tracking-wider mb-3 animate-float text-glow"
                aria-label={title}
              >
                {title}
              </h1>
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse-glow" />
            </div>
            <span className="block text-2xl font-medium text-blue-300 mt-2 tracking-wide">
              COMUNICACIONES
            </span>
          </div>

          {/* Glass Container */}
          <div className="glass rounded-2xl p-8 relative overflow-hidden backdrop-blur bg-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            {children || <p className="text-gray-300 text-center">No content available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
