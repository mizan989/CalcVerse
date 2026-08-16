import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function BentoCard({ children, className = '', theme, title, subtitle, icon: Icon, action }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border p-5 md:p-6 transition-all duration-200 ${theme.panel} ${theme.panelBorder} ${className}`}
    >
      {/* Spotlight gradient effect inside card */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.15 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.4), transparent 80%)`,
        }}
      />

      {(title || Icon || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-inherit/40">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className={`p-2 rounded-xl ${theme.badgeBg} ${theme.badgeText}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && <h3 className={`text-sm font-semibold tracking-tight ${theme.text}`}>{title}</h3>}
              {subtitle && <p className={`text-xs ${theme.subtext} font-mono mt-0.5`}>{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
