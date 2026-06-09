'use client';

export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-t-[var(--color-primary)] border-r-[var(--color-secondary)] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-[var(--color-primary)] border-l-[var(--color-secondary)] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      {message && <p className="text-[var(--color-text)] font-medium animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-12">
      {content}
    </div>
  );
}
