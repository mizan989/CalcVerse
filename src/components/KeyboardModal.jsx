import { Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHORTCUT_GROUPS = [
  {
    title: 'Basic Arithmetic',
    items: [
      { key: '0 – 9', desc: 'Input digits' },
      { key: '+  −  *  /', desc: 'Arithmetic operators' },
      { key: 'Enter or =', desc: 'Evaluate expression' },
      { key: 'Backspace', desc: 'Delete last character' },
      { key: 'Esc', desc: 'Clear all (AC)' },
      { key: '.', desc: 'Decimal point' },
      { key: '%', desc: 'Percentage' },
      { key: '(', desc: 'Open parenthesis' },
      { key: ')', desc: 'Close parenthesis' },
    ],
  },
  {
    title: 'Scientific & Functions',
    items: [
      { key: 'S', desc: 'sin(x)' },
      { key: 'C', desc: 'cos(x)' },
      { key: 'T', desc: 'tan(x)' },
      { key: 'L', desc: 'log₁₀(x)' },
      { key: 'N', desc: 'ln(x) natural log' },
      { key: '^', desc: 'Power (xʸ)' },
      { key: '!', desc: 'Factorial (n!)' },
      { key: 'P', desc: 'Pi constant (π)' },
      { key: 'E', desc: "Euler's constant (e)" },
    ],
  },
  {
    title: 'Studio & Navigation',
    items: [
      { key: 'H', desc: 'Toggle history drawer' },
      { key: 'M', desc: 'Toggle audio sound effect' },
      { key: 'Tab', desc: 'Navigate interactive controls' },
    ],
  },
];

export function KeyboardModal({ isOpen, onClose, theme }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative z-10 w-full max-w-2xl rounded-2xl border ${theme.panelBorder} ${theme.panel} shadow-2xl p-6 overflow-hidden`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-inherit/40">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${theme.badgeBg} ${theme.badgeText}`}>
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-semibold tracking-tight ${theme.text}`}>
                    Keyboard Shortcuts Reference
                  </h3>
                  <p className={`text-xs ${theme.subtext} font-mono mt-0.5`}>
                    Calculate at the speed of thought with hardware keybindings
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg ${theme.subtext} hover:${theme.text} hover:bg-white/5 transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcut Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h4 className={`text-xs font-mono font-semibold uppercase tracking-wider ${theme.accent}`}>
                    {group.title}
                  </h4>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-center justify-between gap-2 p-2 rounded-lg border ${theme.panelBorder} bg-black/5 dark:bg-white/5 text-xs`}
                      >
                        <span className={`font-mono ${theme.subtext}`}>{item.desc}</span>
                        <kbd className={`px-2 py-0.5 rounded font-mono font-semibold text-[11px] border ${theme.panelBorder} ${theme.badgeBg} ${theme.badgeText} shadow-xs`}>
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
