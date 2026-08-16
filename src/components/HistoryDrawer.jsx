import { useState } from 'react';
import { History, Copy, Trash2, X, Check, Download, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function HistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onSelectEntry,
  onDeleteEntry,
  onClearHistory,
  theme,
  isEmbedded = false,
}) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredHistory = history.filter(
    (item) =>
      item.expr.toLowerCase().includes(search.toLowerCase()) ||
      item.result.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (e, item) => {
    e.stopPropagation();
    const txt = `${item.expr} = ${item.result}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1400);
    }
  };

  const handleExport = () => {
    if (history.length === 0) return;
    const content = history
      .map((h, i) => `[${i + 1}] ${h.expr} = ${h.result} (${new Date(h.timestamp || Date.now()).toLocaleTimeString()})`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calcverse-history-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const content = (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3.5 border-b ${theme.panelBorder}`}>
        <div className="flex items-center gap-2">
          <History className={`w-4 h-4 ${theme.accent}`} />
          <span className={`font-mono text-sm font-semibold tracking-tight ${theme.text}`}>
            Notebook History
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
            {history.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {history.length > 0 && (
            <button
              onClick={handleExport}
              title="Export to file"
              className={`p-1.5 rounded-lg text-xs font-mono ${theme.subtext} hover:${theme.text} hover:bg-white/5 transition-colors`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear all history"
              className={`p-1.5 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isEmbedded && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${theme.subtext} hover:${theme.text} hover:bg-white/5 transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {history.length > 3 && (
        <div className={`px-3 py-2 border-b ${theme.panelBorder}`}>
          <div className="relative flex items-center">
            <Search className={`absolute left-2.5 w-3.5 h-3.5 ${theme.subtext}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calculations..."
              className={`w-full pl-8 pr-3 py-1 text-xs rounded-lg font-mono outline-none border ${theme.panelBorder} bg-black/5 dark:bg-white/5 ${theme.text} placeholder:opacity-40`}
            />
          </div>
        </div>
      )}

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <History className={`w-8 h-8 ${theme.subtext} opacity-30 mb-2`} />
            <p className={`text-xs font-mono ${theme.text} font-medium`}>No calculations yet</p>
            <p className={`text-[11px] ${theme.subtext} mt-1 max-w-[180px]`}>
              Evaluated expressions and formulas will appear here.
            </p>
          </div>
        )}

        {history.length > 0 && filteredHistory.length === 0 && (
          <p className={`text-xs font-mono ${theme.subtext} text-center py-8`}>
            No results match "{search}"
          </p>
        )}

        <AnimatePresence>
          {filteredHistory.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onSelectEntry(item)}
              className={`group relative p-2.5 rounded-xl border border-transparent hover:${theme.panelBorder} ${theme.historyItemHover} cursor-pointer transition-all duration-150`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-mono-math ${theme.subtext} truncate`}>{item.expr}</p>
                  <p className={`text-sm font-mono-math font-medium ${theme.text} truncate mt-0.5`}>
                    = {item.result}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => handleCopy(e, item)}
                    title="Copy expression and result"
                    className={`p-1 rounded-md ${theme.subtext} hover:${theme.text} hover:bg-white/10`}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(item.id);
                    }}
                    title="Delete item"
                    className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <div className={`w-full h-full rounded-2xl border ${theme.panelBorder} ${theme.panel} overflow-hidden`}>
        {content}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`relative z-10 w-full max-w-sm h-full ${theme.panel} border-l ${theme.panelBorder} shadow-2xl flex flex-col`}
          >
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
