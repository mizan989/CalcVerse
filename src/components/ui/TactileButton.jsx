import { motion } from 'framer-motion';
import { playKeySound } from '../../utils/audio';

export function TactileButton({
  label,
  sublabel,
  shortcut,
  onClick,
  tone = 'num', // 'num' | 'op' | 'func' | 'eq' | 'action' | 'danger'
  theme,
  wide = false,
  className = '',
  labelClassName = '',
  isMuted = false,
  soundType = 'digit',
  disabled = false,
}) {
  const handleClick = (e) => {
    if (disabled) return;
    playKeySound(soundType || (tone === 'eq' ? 'equals' : tone === 'op' ? 'op' : 'digit'), isMuted);
    if (onClick) onClick(e);
  };

  // Tone styling based on theme
  let toneClass = `${theme.btnBg} ${theme.btnText} ${theme.btnBorder || 'border-transparent'} hover:${theme.btnHover}`;
  if (tone === 'op') {
    toneClass = `${theme.opBg} ${theme.opText} hover:${theme.opHover}`;
  } else if (tone === 'func') {
    toneClass = `${theme.funcBg} ${theme.funcText} hover:${theme.funcHover}`;
  } else if (tone === 'eq') {
    toneClass = `${theme.eqBg} ${theme.eqText} hover:${theme.eqHover} shadow-md`;
  } else if (tone === 'action') {
    toneClass = `${theme.actionBg} ${theme.actionText} hover:${theme.actionHover}`;
  } else if (tone === 'danger') {
    toneClass = `${theme.dangerBg} ${theme.dangerText} hover:${theme.dangerHover}`;
  }

  return (
    <motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ y: 2, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      onClick={handleClick}
      disabled={disabled}
      className={`relative select-none flex flex-col items-center justify-center rounded-xl font-calc-btn transition-colors duration-100 border text-center ${toneClass} ${
        wide ? 'col-span-2' : ''
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {/* Top subtle highlight rim */}
      <span className="absolute inset-x-1.5 top-0.5 h-[1px] bg-white/10 rounded-full pointer-events-none" />

      {/* Main label */}
      <span className={`leading-none select-none tracking-tight ${labelClassName || ''}`}>{label}</span>

      {/* Secondary sublabel (e.g. inverse or secondary function) */}
      {sublabel && (
        <span className="text-[9px] sm:text-[10px] opacity-60 font-calc-btn font-normal mt-0.5 leading-none tracking-tight">{sublabel}</span>
      )}

      {/* Optional tiny keyboard shortcut badge */}
      {shortcut && (
        <span className="absolute bottom-1 right-1.5 text-[8px] opacity-35 font-calc-btn font-medium pointer-events-none hidden sm:inline">
          {shortcut}
        </span>
      )}
    </motion.button>
  );
}
