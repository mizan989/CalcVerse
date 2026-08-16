import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function InspiraDock({ items, className = '', theme }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`mx-auto flex h-14 items-center gap-2 rounded-2xl border px-3 py-2 shadow-xl glass-panel ${theme.dockBg} ${theme.dockBorder} ${className}`}
    >
      {items.map((item, index) => (
        <DockIcon key={index} mouseX={mouseX} item={item} theme={theme} />
      ))}
    </motion.div>
  );
}

function DockIcon({ mouseX, item, theme }) {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [38, 52, 38]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 14 });

  const Icon = item.icon;

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      onClick={item.onClick}
      className={`relative flex items-center justify-center rounded-xl transition-colors duration-150 group ${
        item.active ? theme.dockActive : theme.dockIdle
      } hover:${theme.dockHover}`}
      title={item.label}
    >
      <Icon className="w-5 h-5 transition-transform duration-150 group-hover:scale-110" />
      {item.badge !== undefined && item.badge !== null && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono bg-emerald-500 text-white">
          {item.badge}
        </span>
      )}
      {/* Tooltip */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
        {item.label}
      </span>
    </motion.button>
  );
}
