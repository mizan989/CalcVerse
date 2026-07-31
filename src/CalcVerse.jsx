import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as math from 'mathjs';
import { Sun, MoonStar, TerminalSquare, History, Copy, Trash2, X, Menu, Keyboard, Check } from 'lucide-react';

const THEMES = {
  dark: {
    name: 'DARK',
    bg: 'bg-zinc-950',
    panel: 'bg-zinc-900',
    panelBorder: 'border-zinc-800',
    text: 'text-zinc-100',
    subtext: 'text-zinc-500',
    accent: 'text-emerald-400',
    accentBorder: 'border-emerald-500',
    btnBg: 'bg-zinc-800',
    btnHover: 'hover:bg-zinc-700',
    btnActiveBg: 'active:bg-zinc-600',
    btnText: 'text-zinc-100',
    funcBg: 'bg-zinc-800/60',
    funcText: 'text-emerald-400',
    opBg: 'bg-zinc-800',
    opText: 'text-emerald-400',
    eqBg: 'bg-emerald-500',
    eqHover: 'hover:bg-emerald-400',
    eqText: 'text-zinc-950',
    displayBg: 'bg-zinc-900',
    toolbarActive: 'bg-emerald-500 text-zinc-950',
    toolbarIdle: 'bg-zinc-800 text-zinc-400',
    caret: 'bg-emerald-400',
  },
  light: {
    name: 'LIGHT',
    bg: 'bg-zinc-100',
    panel: 'bg-white',
    panelBorder: 'border-zinc-200',
    text: 'text-zinc-900',
    subtext: 'text-zinc-400',
    accent: 'text-emerald-600',
    accentBorder: 'border-emerald-600',
    btnBg: 'bg-zinc-100',
    btnHover: 'hover:bg-zinc-200',
    btnActiveBg: 'active:bg-zinc-300',
    btnText: 'text-zinc-800',
    funcBg: 'bg-zinc-100',
    funcText: 'text-emerald-700',
    opBg: 'bg-zinc-200',
    opText: 'text-emerald-700',
    eqBg: 'bg-emerald-600',
    eqHover: 'hover:bg-emerald-500',
    eqText: 'text-white',
    displayBg: 'bg-white',
    toolbarActive: 'bg-emerald-600 text-white',
    toolbarIdle: 'bg-zinc-200 text-zinc-500',
    caret: 'bg-emerald-600',
  },
  cyber: {
    name: 'CYBER',
    bg: 'bg-black',
    panel: 'bg-zinc-950',
    panelBorder: 'border-fuchsia-500/40',
    text: 'text-emerald-300',
    subtext: 'text-fuchsia-400/70',
    accent: 'text-fuchsia-400',
    accentBorder: 'border-fuchsia-500',
    btnBg: 'bg-zinc-900',
    btnHover: 'hover:bg-zinc-800',
    btnActiveBg: 'active:bg-zinc-700',
    btnText: 'text-emerald-300',
    funcBg: 'bg-zinc-900',
    funcText: 'text-fuchsia-400',
    opBg: 'bg-zinc-900',
    opText: 'text-fuchsia-400',
    eqBg: 'bg-fuchsia-500',
    eqHover: 'hover:bg-fuchsia-400',
    eqText: 'text-black',
    displayBg: 'bg-black',
    toolbarActive: 'bg-fuchsia-500 text-black',
    toolbarIdle: 'bg-zinc-900 text-fuchsia-400/60',
    caret: 'bg-fuchsia-400',
  },
};

const THEME_ORDER = ['dark', 'light', 'cyber'];

function formatNumber(val) {
  if (val === null || val === undefined) return '0';
  if (typeof val === 'object' && val.toString) {
    try { val = val.toNumber ? val.toNumber() : Number(val); } catch (e) { /* keep */ }
  }
  if (typeof val !== 'number') {
    try { val = Number(val); } catch (e) { return String(val); }
  }
  if (Number.isNaN(val)) throw new Error('NaN');
  if (!Number.isFinite(val)) throw new Error('INF');
  if (Math.abs(val) > 1e15 || (Math.abs(val) < 1e-10 && val !== 0)) {
    return val.toExponential(6).replace(/\.?0+e/, 'e');
  }
  let s = math.format(val, { precision: 12 });
  if (s.includes('.')) {
    s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return s;
}

const FUNC_MAP = {
  sin: 'sin(', cos: 'cos(', tan: 'tan(',
  asin: 'asin(', acos: 'acos(', atan: 'atan(',
  log: 'log10(', ln: 'log(', exp: 'exp(',
  pow10: '10^(', powe: 'exp(',
  sqrt: 'sqrt(', cbrt: 'cbrt(',
  abs: 'abs(', floor: 'floor(', ceil: 'ceil(', round: 'round(',
};

export default function CalcVerse() {
  const [themeKey, setThemeKey] = useState('dark');
  const t = THEMES[themeKey];

  const [angleMode, setAngleMode] = useState('DEG'); // DEG | RAD
  const [inv, setInv] = useState(false);
  const [expression, setExpression] = useState('');
  const [prevLine, setPrevLine] = useState('');
  const [error, setError] = useState(null);
  const [memory, setMemory] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const mathInstance = useMemo(() => math.create(math.all), []);

  useEffect(() => {
    const toRad = (x) => (angleMode === 'DEG' ? (x * Math.PI) / 180 : x);
    const toDeg = (x) => (angleMode === 'DEG' ? (x * 180) / Math.PI : x);
    mathInstance.import(
      {
        sin: (x) => Math.sin(toRad(x)),
        cos: (x) => Math.cos(toRad(x)),
        tan: (x) => Math.tan(toRad(x)),
        asin: (x) => toDeg(Math.asin(x)),
        acos: (x) => toDeg(Math.acos(x)),
        atan: (x) => toDeg(Math.atan(x)),
      },
      { override: true }
    );
  }, [angleMode, mathInstance]);

  const livePreview = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      const val = mathInstance.evaluate(expression);
      if (typeof val === 'function') return null;
      return formatNumber(val);
    } catch (e) {
      return null;
    }
  }, [expression, mathInstance]);

  const getCurrentValue = useCallback(() => {
    try {
      const source = expression.trim() ? expression : prevLine.split('=').pop();
      const val = mathInstance.evaluate(source || '0');
      return typeof val === 'number' ? val : Number(val);
    } catch (e) {
      return null;
    }
  }, [expression, prevLine, mathInstance]);

  const insertText = (txt) => {
    setError(null);
    setJustEvaluated(false);
    setExpression((prev) => prev + txt);
  };

  const clearAll = () => {
    setExpression('');
    setPrevLine('');
    setError(null);
    setJustEvaluated(false);
  };

  const backspace = () => {
    setError(null);
    setExpression((prev) => prev.slice(0, -1));
  };

  const evaluate = useCallback(() => {
    if (!expression.trim()) return;
    try {
      const val = mathInstance.evaluate(expression);
      if (typeof val === 'function') throw new Error('Syntax Error');
      const formatted = formatNumber(val);
      setHistory((h) => [{ id: Date.now() + Math.random(), expr: expression, result: formatted }, ...h].slice(0, 100));
      setPrevLine(`${expression} =`);
      setExpression(formatted);
      setError(null);
      setJustEvaluated(true);
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('INF') || /divide/i.test(msg)) setError('Cannot divide by zero');
      else if (msg.includes('NaN')) setError('Domain Error');
      else if (/unexpected|parenthes|undefined symbol|unexpected end/i.test(msg)) setError('Syntax Error');
      else setError('Invalid Expression');
    }
  }, [expression, mathInstance]);

  const applyUnaryNow = (fn) => {
    const val = getCurrentValue();
    if (val === null) { setError('Invalid Expression'); return; }
    try {
      const res = fn(val);
      setExpression(formatNumber(res));
      setPrevLine('');
      setError(null);
    } catch (e) {
      setError('Domain Error');
    }
  };

  const appendPostfix = (op) => {
    if (!expression.trim()) return;
    setExpression((prev) => prev + op);
  };

  // Memory
  const memMS = () => { const v = getCurrentValue(); if (v !== null) setMemory(v); };
  const memMC = () => setMemory(null);
  const memMR = () => { if (memory !== null) insertText(formatNumber(memory)); };
  const memMPlus = () => { const v = getCurrentValue(); if (v !== null) setMemory((m) => (m || 0) + v); };
  const memMMinus = () => { const v = getCurrentValue(); if (v !== null) setMemory((m) => (m || 0) - v); };

  const cycleTheme = () => {
    setThemeKey((k) => THEME_ORDER[(THEME_ORDER.indexOf(k) + 1) % THEME_ORDER.length]);
  };

  const handleAction = (action) => {
    switch (action.type) {
      case 'digit':
      case 'op':
        if (justEvaluated && /^[0-9.]/.test(action.value)) { setExpression(action.value); setPrevLine(''); setJustEvaluated(false); }
        else if (justEvaluated) { insertText(action.value); setPrevLine(''); }
        else insertText(action.value);
        break;
      case 'func':
        insertText(justEvaluated ? '' : '');
        setJustEvaluated(false);
        setExpression((prev) => (justEvaluated ? action.value : prev + action.value));
        break;
      case 'postfix':
        setJustEvaluated(false);
        appendPostfix(action.value);
        break;
      case 'const':
        if (justEvaluated) { setExpression(action.value); setPrevLine(''); setJustEvaluated(false); }
        else insertText(action.value);
        break;
      case 'clear': clearAll(); break;
      case 'back': backspace(); break;
      case 'equals': evaluate(); break;
      case 'toggleSign': applyUnaryNow((v) => -v); break;
      case 'reciprocal': applyUnaryNow((v) => 1 / v); break;
      case 'percent': applyUnaryNow((v) => v / 100); break;
      case 'mc': memMC(); break;
      case 'mr': memMR(); break;
      case 'ms': memMS(); break;
      case 'm+': memMPlus(); break;
      case 'm-': memMMinus(); break;
      default: break;
    }
  };

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) { handleAction({ type: 'digit', value: k }); return; }
      if (['+', '-', '*', '/', '(', ')', '.', '%', '^'].includes(k)) {
        const map = { '*': '*', '/': '/', '+': '+', '-': '-', '(': '(', ')': ')', '.': '.', '^': '^', '%': '%' };
        handleAction({ type: 'op', value: map[k] });
        return;
      }
      if (k === 'Enter' || k === '=') { e.preventDefault(); handleAction({ type: 'equals' }); return; }
      if (k === 'Backspace') { handleAction({ type: 'back' }); return; }
      if (k === 'Escape') { handleAction({ type: 'clear' }); return; }
      if (k.toLowerCase() === 's') handleAction({ type: 'func', value: 'sin(' });
      if (k.toLowerCase() === 'c') handleAction({ type: 'func', value: 'cos(' });
      if (k.toLowerCase() === 't') handleAction({ type: 'func', value: 'tan(' });
      if (k.toLowerCase() === 'l') handleAction({ type: 'func', value: 'log10(' });
      if (k.toLowerCase() === 'n') handleAction({ type: 'func', value: 'log(' });
      if (k.toLowerCase() === 'p') handleAction({ type: 'const', value: 'pi' });
      if (k.toLowerCase() === 'e' && !e.ctrlKey && !e.metaKey) handleAction({ type: 'const', value: 'e' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, justEvaluated, memory]);

  const copyEntry = (entry) => {
    const text = `${entry.expr} = ${entry.result}`;
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 1200);
  };
  const deleteEntry = (id) => setHistory((h) => h.filter((x) => x.id !== id));
  const clearHistory = () => setHistory([]);
  const useEntry = (entry) => { setExpression(entry.result); setPrevLine(''); setJustEvaluated(true); setShowHistory(false); };

  // Button layout
  const funcRow1 = inv
    ? [
        { label: 'sin⁻¹', action: { type: 'func', value: 'asin(' } },
        { label: 'cos⁻¹', action: { type: 'func', value: 'acos(' } },
        { label: 'tan⁻¹', action: { type: 'func', value: 'atan(' } },
        { label: '10ˣ', action: { type: 'func', value: '10^(' } },
        { label: 'eˣ', action: { type: 'func', value: 'exp(' } },
      ]
    : [
        { label: 'sin', action: { type: 'func', value: 'sin(' } },
        { label: 'cos', action: { type: 'func', value: 'cos(' } },
        { label: 'tan', action: { type: 'func', value: 'tan(' } },
        { label: 'log', action: { type: 'func', value: 'log10(' } },
        { label: 'ln', action: { type: 'func', value: 'log(' } },
      ];

  const funcRow2 = [
    { label: '(', action: { type: 'op', value: '(' } },
    { label: ')', action: { type: 'op', value: ')' } },
    { label: 'x²', action: { type: 'postfix', value: '^2' } },
    { label: 'x³', action: { type: 'postfix', value: '^3' } },
    { label: 'xʸ', action: { type: 'op', value: '^' } },
  ];

  const funcRow3 = [
    { label: '√x', action: { type: 'func', value: 'sqrt(' } },
    { label: '∛x', action: { type: 'func', value: 'cbrt(' } },
    { label: 'π', action: { type: 'const', value: 'pi' } },
    { label: 'e', action: { type: 'const', value: 'e' } },
    { label: 'n!', action: { type: 'postfix', value: '!' } },
  ];

  const funcRow4 = [
    { label: '|x|', action: { type: 'func', value: 'abs(' } },
    { label: '1/x', action: { type: 'reciprocal' } },
    { label: '⌊x⌋', action: { type: 'func', value: 'floor(' } },
    { label: '⌈x⌉', action: { type: 'func', value: 'ceil(' } },
    { label: 'mod', action: { type: 'op', value: ' mod ' } },
  ];

  const FuncBtn = ({ label, action }) => (
    <button
      onClick={() => handleAction(action)}
      className={`min-h-11 rounded-lg text-sm font-mono font-medium ${t.funcBg} ${t.funcText} ${t.btnHover} ${t.btnActiveBg} transition-colors duration-100 border ${t.panelBorder}`}
    >
      {label}
    </button>
  );

  const NumBtn = ({ label, action, wide, tone }) => {
    const toneClass =
      tone === 'op'
        ? `${t.opBg} ${t.opText} font-semibold`
        : tone === 'eq'
        ? `${t.eqBg} ${t.eqText} ${t.eqHover} font-semibold`
        : `${t.btnBg} ${t.btnText}`;
    return (
      <button
        onClick={() => handleAction(action)}
        className={`min-h-12 min-w-12 rounded-lg text-lg font-mono ${toneClass} ${tone !== 'eq' ? t.btnHover : ''} ${t.btnActiveBg} transition-colors duration-100 ${wide ? 'col-span-2' : ''}`}
      >
        {label}
      </button>
    );
  };

  const ToolbarBtn = ({ label, active, onClick, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`px-2.5 h-8 rounded-md text-xs font-mono font-semibold whitespace-nowrap transition-colors duration-100 ${active ? t.toolbarActive : t.toolbarIdle} ${t.btnHover}`}
    >
      {label}
    </button>
  );

  const historyContent = (
    <div className="flex flex-col h-full min-h-0">
      <div className={`flex items-center justify-between px-4 py-3 border-b ${t.panelBorder}`}>
        <span className={`font-mono text-sm font-semibold ${t.accent}`}>~/history</span>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button onClick={clearHistory} className={`text-xs font-mono ${t.subtext} ${t.btnHover} px-2 py-1 rounded`}>
              clear all
            </button>
          )}
          <button onClick={() => setShowHistory(false)} className={`md:hidden ${t.subtext} p-1`}>
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {history.length === 0 && (
          <p className={`text-xs font-mono ${t.subtext} px-2 py-4 text-center`}>no calculations yet</p>
        )}
        {history.map((entry) => (
          <div key={entry.id} className={`group px-3 py-2 rounded-lg ${t.btnHover} cursor-pointer`} onClick={() => useEntry(entry)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-mono ${t.subtext} truncate`}>{entry.expr}</p>
                <p className={`text-sm font-mono ${t.text} font-semibold truncate`}>{entry.result}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={(e) => { e.stopPropagation(); copyEntry(entry); }} className={`p-1 rounded ${t.subtext} hover:${t.accent}`}>
                  {copiedId === entry.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }} className={`p-1 rounded ${t.subtext} hover:text-red-400`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`w-full min-h-[640px] ${t.bg} ${t.text} font-mono flex items-stretch justify-center transition-colors duration-200`}>
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 p-3 sm:p-6">
        {/* Main calculator column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TerminalSquare size={20} className={t.accent} />
              <span className="text-lg font-bold tracking-tight">
                Calc<span className={t.accent}>Verse</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShortcuts((s) => !s)}
                className={`p-2 rounded-lg ${t.btnBg} ${t.btnHover} ${t.subtext}`}
                title="Keyboard shortcuts"
              >
                <Keyboard size={16} />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className={`p-2 rounded-lg ${t.btnBg} ${t.btnHover} ${t.subtext} md:hidden`}
                title="History"
              >
                <History size={16} />
              </button>
              <button
                onClick={cycleTheme}
                className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg ${t.btnBg} ${t.btnHover} text-xs font-semibold ${t.accent}`}
                title="Cycle theme"
              >
                {themeKey === 'dark' && <MoonStar size={14} />}
                {themeKey === 'light' && <Sun size={14} />}
                {themeKey === 'cyber' && <TerminalSquare size={14} />}
                {t.name}
              </button>
            </div>
          </div>

          {showShortcuts && (
            <div className={`mb-3 p-3 rounded-lg border ${t.panelBorder} ${t.panel} text-xs ${t.subtext} grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1`}>
              <span>S = sin</span><span>C = cos</span><span>T = tan</span>
              <span>L = log</span><span>N = ln</span><span>P = π</span>
              <span>E = euler's e</span><span>Enter = evaluate</span><span>Esc = clear</span>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <ToolbarBtn label={angleMode} active={angleMode === 'DEG'} onClick={() => setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))} title="Toggle degrees/radians" />
            <ToolbarBtn label="INV" active={inv} onClick={() => setInv((v) => !v)} title="Toggle inverse functions" />
            <div className={`w-px h-5 ${t.panelBorder} border-l mx-1`} />
            <ToolbarBtn label="MC" active={false} onClick={() => handleAction({ type: 'mc' })} title="Memory clear" />
            <ToolbarBtn label="MR" active={memory !== null} onClick={() => handleAction({ type: 'mr' })} title="Memory recall" />
            <ToolbarBtn label="MS" active={false} onClick={() => handleAction({ type: 'ms' })} title="Memory store" />
            <ToolbarBtn label="M+" active={false} onClick={() => handleAction({ type: 'm+' })} title="Memory add" />
            <ToolbarBtn label="M-" active={false} onClick={() => handleAction({ type: 'm-' })} title="Memory subtract" />
          </div>

          {/* Display */}
          <div className={`rounded-xl border ${t.panelBorder} ${t.displayBg} px-4 py-4 mb-3 min-h-[104px] flex flex-col justify-end`}>
            <div className={`text-right text-xs font-mono ${t.subtext} h-4 truncate`}>{error ? '' : prevLine}</div>
            <div className={`text-right font-mono font-semibold text-3xl sm:text-4xl ${error ? 'text-red-400' : t.text} truncate flex items-center justify-end gap-1`}>
              {error ? error : (expression || '0')}
              {!error && <span className={`inline-block w-0.5 h-7 sm:h-8 ${t.caret} animate-pulse`} />}
            </div>
            <div className={`text-right text-sm font-mono ${t.accent} h-5 truncate opacity-70`}>
              {!error && livePreview && livePreview !== expression ? `= ${livePreview}` : '\u00A0'}
            </div>
          </div>

          {/* Function grid */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {funcRow1.map((b) => <FuncBtn key={b.label} {...b} />)}
            {funcRow2.map((b) => <FuncBtn key={b.label} {...b} />)}
            {funcRow3.map((b) => <FuncBtn key={b.label} {...b} />)}
            {funcRow4.map((b) => <FuncBtn key={b.label} {...b} />)}
          </div>

          {/* Numeric keypad */}
          <div className="grid grid-cols-4 gap-2 flex-1">
            <NumBtn label="AC" action={{ type: 'clear' }} tone="op" />
            <NumBtn label="⌫" action={{ type: 'back' }} tone="op" />
            <NumBtn label="%" action={{ type: 'percent' }} tone="op" />
            <NumBtn label="÷" action={{ type: 'op', value: '/' }} tone="op" />

            <NumBtn label="7" action={{ type: 'digit', value: '7' }} />
            <NumBtn label="8" action={{ type: 'digit', value: '8' }} />
            <NumBtn label="9" action={{ type: 'digit', value: '9' }} />
            <NumBtn label="×" action={{ type: 'op', value: '*' }} tone="op" />

            <NumBtn label="4" action={{ type: 'digit', value: '4' }} />
            <NumBtn label="5" action={{ type: 'digit', value: '5' }} />
            <NumBtn label="6" action={{ type: 'digit', value: '6' }} />
            <NumBtn label="−" action={{ type: 'op', value: '-' }} tone="op" />

            <NumBtn label="1" action={{ type: 'digit', value: '1' }} />
            <NumBtn label="2" action={{ type: 'digit', value: '2' }} />
            <NumBtn label="3" action={{ type: 'digit', value: '3' }} />
            <NumBtn label="+" action={{ type: 'op', value: '+' }} tone="op" />

            <NumBtn label="±" action={{ type: 'toggleSign' }} tone="op" />
            <NumBtn label="0" action={{ type: 'digit', value: '0' }} />
            <NumBtn label="." action={{ type: 'op', value: '.' }} />
            <NumBtn label="=" action={{ type: 'equals' }} tone="eq" />
          </div>
        </div>

        {/* Desktop history sidebar */}
        <div className={`hidden md:flex md:w-64 rounded-xl border ${t.panelBorder} ${t.panel} flex-col`}>
          {historyContent}
        </div>

        {/* Mobile history drawer */}
        {showHistory && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowHistory(false)} />
            <div className={`absolute right-0 top-0 h-full w-72 max-w-[85%] ${t.panel} border-l ${t.panelBorder} shadow-2xl`}>
              {historyContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
