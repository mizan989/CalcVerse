import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CalculatorDisplay({
  expression,
  prevLine,
  error,
  livePreview,
  angleMode,
  memory,
  inv,
  theme,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = error ? '' : (expression || '0');
    if (!textToCopy) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className={`relative w-full rounded-2xl border p-3 sm:p-4 transition-all duration-200 ${theme.displayBg} ${theme.panelBorder} shadow-xs group`}>
      {/* Top Status & Register Badges */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-calc-btn font-medium tracking-wider border ${
            angleMode === 'DEG' ? theme.activeBadge : theme.idleBadge
          }`}>
            {angleMode}
          </span>
          {inv && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-calc-btn font-medium tracking-wider border ${theme.activeBadge}`}>
              INV
            </span>
          )}
          {memory !== null && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-calc-btn font-medium tracking-wider border ${theme.activeBadge}`} title={`Memory: ${memory}`}>
              MEM: {typeof memory === 'number' ? Number(memory.toFixed(3)) : memory}
            </span>
          )}
        </div>

        {/* Copy / Action tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-calc-btn font-medium transition-opacity duration-150 ${
              copied ? 'text-emerald-500 bg-emerald-500/10' : `${theme.subtext} hover:${theme.text} hover:bg-white/5`
            }`}
            title="Copy current value"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span className="text-[10px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                <span className="text-[10px] hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Previous Calculation Breadcrumb Trail */}
      <div className="min-h-[16px] flex items-center justify-end overflow-hidden">
        <AnimatePresence mode="wait">
          {prevLine && !error && (
            <motion.div
              key={prevLine}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-right font-mono-math text-[11px] sm:text-xs ${theme.subtext} truncate`}
            >
              {prevLine}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Calculation Display Output */}
      <div className="relative flex items-baseline justify-end min-h-[40px] sm:min-h-[50px] overflow-x-auto overflow-y-hidden py-0.5">
        <div
          className={`font-mono-math font-light tracking-tight text-right text-2xl sm:text-4xl leading-none transition-colors duration-150 ${
            error ? 'text-rose-500 font-normal text-xl sm:text-2xl' : theme.text
          }`}
        >
          {error ? error : (expression || '0')}
        </div>

        {/* Blinking Minimalist Caret */}
        {!error && (
          <span className={`inline-block w-[2.5px] h-6 sm:h-7 ml-1 rounded-full ${theme.caret} animate-pulse shrink-0 self-center`} />
        )}
      </div>

      {/* Live Preview / Instant Evaluation Footnote */}
      <div className="min-h-[16px] flex items-center justify-end">
        {!error && livePreview && livePreview !== expression && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-1 font-mono-math text-[11px] sm:text-xs font-medium ${theme.previewText}`}
          >
            <span className="opacity-50 text-[9px]">≈</span>
            <span>{livePreview}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
