export function GridBackground({ mode = 'dots', children, className = '' }) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Subtle Ambient Background Pattern */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 ${
          mode === 'dots' ? 'bg-dot-pattern' : 'bg-grid-pattern'
        } opacity-60`}
      />
      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
