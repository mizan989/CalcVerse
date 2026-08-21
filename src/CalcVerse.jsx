import { useState, useEffect, useMemo, useCallback } from 'react';
import * as math from 'mathjs';
import confetti from 'canvas-confetti';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  History,
  Keyboard,
  Compass,
  Activity,
  Cpu,
} from 'lucide-react';

import { LenisProvider } from './components/ui/LenisProvider';
import { useLenis } from './hooks/useLenis';
import { Spotlight } from './components/ui/Spotlight';
import { GridBackground } from './components/ui/GridBackground';
import { InspiraDock } from './components/ui/InspiraDock';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { Keypad } from './components/Keypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { UnitConverterSection } from './components/UnitConverterSection';
import { PlotterSection } from './components/PlotterSection';
import { KeyboardModal } from './components/KeyboardModal';
import { playKeySound } from './utils/audio';
import { THEMES, THEME_KEYS } from './constants/themes';

function formatNumber(val) {
  if (val === null || val === undefined) return '0';
  if (typeof val === 'object' && val.toString) {
    try {
      val = val.toNumber ? val.toNumber() : Number(val);
    } catch {
      /* keep */
    }
  }
  if (typeof val !== 'number') {
    try {
      val = Number(val);
    } catch {
      return String(val);
    }
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

export function CalcVerseContent() {
  const [themeKey, setThemeKey] = useState('obsidian');
  const [calcMode, setCalcMode] = useState('scientific'); // 'scientific' | 'standard' | 'programmer'
  const [angleMode, setAngleMode] = useState('DEG'); // DEG | RAD
  const [inv, setInv] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [expression, setExpression] = useState('');
  const [prevLine, setPrevLine] = useState('');
  const [error, setError] = useState(null);
  const [memory, setMemory] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const { scrollTo } = useLenis();
  const theme = THEMES[themeKey] || THEMES.obsidian;

  const mathInstance = useMemo(() => math.create(math.all), []);

  // Update trigonometric angle modes in mathjs
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

  // Live evaluation preview
  const livePreview = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      const val = mathInstance.evaluate(expression);
      if (typeof val === 'function') return null;
      return formatNumber(val);
    } catch {
      return null;
    }
  }, [expression, mathInstance]);

  const getCurrentValue = useCallback(() => {
    try {
      const source = expression.trim() ? expression : prevLine.split('=').pop();
      const val = mathInstance.evaluate(source || '0');
      return typeof val === 'number' ? val : Number(val);
    } catch {
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
    playKeySound('clear', isMuted);
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

      // Easter egg celebration for milestone math results
      if (['42', '3.14159265', '1337'].includes(formatted)) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }

      setHistory((h) => [
        { id: Date.now() + Math.random(), expr: expression, result: formatted, timestamp: Date.now() },
        ...h,
      ].slice(0, 100));

      setPrevLine(`${expression} =`);
      setExpression(formatted);
      setError(null);
      setJustEvaluated(true);
      playKeySound('equals', isMuted);
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('INF') || /divide/i.test(msg)) setError('Cannot divide by zero');
      else if (msg.includes('NaN')) setError('Domain Error');
      else if (/unexpected|parenthes|undefined symbol|unexpected end/i.test(msg)) setError('Syntax Error');
      else setError('Invalid Expression');
    }
  }, [expression, mathInstance, isMuted]);

  const applyUnaryNow = (fn) => {
    const val = getCurrentValue();
    if (val === null) {
      setError('Invalid Expression');
      return;
    }
    try {
      const res = fn(val);
      setExpression(formatNumber(res));
      setPrevLine('');
      setError(null);
      playKeySound('func', isMuted);
    } catch {
      setError('Domain Error');
    }
  };

  const appendPostfix = (op) => {
    if (!expression.trim()) return;
    setExpression((prev) => prev + op);
  };

  // Base conversions for Programmer mode
  const convertBase = (targetBase) => {
    const val = getCurrentValue();
    if (val === null) return;
    const intVal = Math.floor(val);
    if (targetBase === 'hex') setExpression(`0x${intVal.toString(16).toUpperCase()}`);
    if (targetBase === 'bin') setExpression(`0b${intVal.toString(2)}`);
    if (targetBase === 'oct') setExpression(`0o${intVal.toString(8)}`);
    setPrevLine(`DEC: ${intVal} →`);
    setJustEvaluated(true);
  };

  // Memory Registers
  const memMS = () => {
    const v = getCurrentValue();
    if (v !== null) setMemory(v);
  };
  const memMC = () => setMemory(null);
  const memMR = () => {
    if (memory !== null) insertText(formatNumber(memory));
  };
  const memMPlus = () => {
    const v = getCurrentValue();
    if (v !== null) setMemory((m) => (m || 0) + v);
  };
  const memMMinus = () => {
    const v = getCurrentValue();
    if (v !== null) setMemory((m) => (m || 0) - v);
  };

  const cycleTheme = () => {
    setThemeKey((k) => THEME_KEYS[(THEME_KEYS.indexOf(k) + 1) % THEME_KEYS.length]);
  };

  const handleAction = (action) => {
    switch (action.type) {
      case 'digit':
      case 'op':
        if (justEvaluated && /^[0-9.]/.test(action.value)) {
          setExpression(action.value);
          setPrevLine('');
          setJustEvaluated(false);
        } else if (justEvaluated) {
          insertText(action.value);
          setPrevLine('');
        } else {
          insertText(action.value);
        }
        break;
      case 'func':
        if (justEvaluated) {
          setExpression(action.value);
          setPrevLine('');
          setJustEvaluated(false);
        } else {
          insertText(action.value);
        }
        break;
      case 'postfix':
        setJustEvaluated(false);
        appendPostfix(action.value);
        break;
      case 'const':
        if (justEvaluated) {
          setExpression(action.value);
          setPrevLine('');
          setJustEvaluated(false);
        } else {
          insertText(action.value);
        }
        break;
      case 'base':
        convertBase(action.value);
        break;
      case 'clear':
        clearAll();
        break;
      case 'back':
        backspace();
        break;
      case 'equals':
        evaluate();
        break;
      case 'toggleSign':
        applyUnaryNow((v) => -v);
        break;
      case 'reciprocal':
        applyUnaryNow((v) => 1 / v);
        break;
      case 'percent':
        applyUnaryNow((v) => v / 100);
        break;
      case 'mc':
        memMC();
        break;
      case 'mr':
        memMR();
        break;
      case 'ms':
        memMS();
        break;
      case 'm+':
        memMPlus();
        break;
      case 'm-':
        memMMinus();
        break;
      default:
        break;
    }
  };

  // Global hardware keyboard listener
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        handleAction({ type: 'digit', value: k });
        return;
      }
      if (['+', '-', '*', '/', '(', ')', '.', '%', '^', '!'].includes(k)) {
        const map = {
          '*': '*',
          '/': '/',
          '+': '+',
          '-': '-',
          '(': '(',
          ')': ')',
          '.': '.',
          '^': '^',
          '%': '%',
          '!': '!',
        };
        if (k === '!') handleAction({ type: 'postfix', value: '!' });
        else handleAction({ type: 'op', value: map[k] });
        return;
      }
      if (k === 'Enter' || k === '=') {
        e.preventDefault();
        handleAction({ type: 'equals' });
        return;
      }
      if (k === 'Backspace') {
        handleAction({ type: 'back' });
        return;
      }
      if (k === 'Escape') {
        handleAction({ type: 'clear' });
        return;
      }
      if (k.toLowerCase() === 's') handleAction({ type: 'func', value: 'sin(' });
      if (k.toLowerCase() === 'c') handleAction({ type: 'func', value: 'cos(' });
      if (k.toLowerCase() === 't') handleAction({ type: 'func', value: 'tan(' });
      if (k.toLowerCase() === 'l') handleAction({ type: 'func', value: 'log10(' });
      if (k.toLowerCase() === 'n') handleAction({ type: 'func', value: 'log(' });
      if (k.toLowerCase() === 'p') handleAction({ type: 'const', value: 'pi' });
      if (k.toLowerCase() === 'e' && !e.ctrlKey && !e.metaKey) handleAction({ type: 'const', value: 'e' });
      if (k.toLowerCase() === 'h') setShowHistoryDrawer((s) => !s);
      if (k.toLowerCase() === 'm' && !e.ctrlKey) setIsMuted((m) => !m);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, justEvaluated, memory, isMuted]);

  const handleSelectHistory = (entry) => {
    setExpression(entry.result);
    setPrevLine(`${entry.expr} =`);
    setJustEvaluated(true);
    setShowHistoryDrawer(false);
  };

  // Inspira Dock Navigation items
  const dockItems = [
    {
      label: 'Calculator Studio',
      icon: Cpu,
      active: true,
      onClick: () => scrollTo('#studio-hero'),
    },
    {
      label: 'Unit Converter',
      icon: Compass,
      active: false,
      onClick: () => scrollTo('#unit-converter'),
    },
    {
      label: 'Function Visualizer',
      icon: Activity,
      active: false,
      onClick: () => scrollTo('#function-plotter'),
    },
    {
      label: `History (${history.length})`,
      icon: History,
      badge: history.length > 0 ? history.length : null,
      active: showHistoryDrawer,
      onClick: () => setShowHistoryDrawer((s) => !s),
    },
    {
      label: isMuted ? 'Sound (Muted)' : 'Sound (On)',
      icon: isMuted ? VolumeX : Volume2,
      active: !isMuted,
      onClick: () => setIsMuted((m) => !m),
    },
    {
      label: 'Shortcuts',
      icon: Keyboard,
      active: showShortcuts,
      onClick: () => setShowShortcuts((s) => !s),
    },
    {
      label: `Theme: ${theme.name}`,
      icon: themeKey === 'alabaster' || themeKey === 'bauhaus' ? Sun : Moon,
      active: false,
      onClick: cycleTheme,
    },
  ];

  return (
    <div className={`w-full min-h-screen overflow-x-hidden ${theme.bg} ${theme.text} transition-colors duration-300 relative flex flex-col selection:bg-emerald-500/20`}>
      {/* Radiant Inspira Spotlight & Ambient Grid */}
      <Spotlight fill={theme.spotlight} className="opacity-25" />
      <GridBackground mode="dots" className="w-full">
        
        {/* SECTION 1: Calculator Studio (Viewport Centered & Balanced) */}
        <section id="studio-hero" className="w-full h-[100dvh] max-h-[100dvh] min-h-[100dvh] flex flex-col justify-between max-w-5xl mx-auto px-4 pt-3 pb-16 overflow-hidden">
          
          {/* Top Minimalist Navigation Header (With Integrated Center Mode Switcher) */}
          <header className="w-full flex items-center justify-between z-20 pb-1 pt-1">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-xl border ${theme.panelBorder} ${theme.badgeBg} ${theme.badgeText} flex items-center justify-center`}>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-base sm:text-lg font-sans-ui">
                  Calc<span className={theme.accent}>Verse</span>
                </span>
                <p className={`text-[10px] font-mono ${theme.subtext} hidden sm:block leading-none mt-0.5`}>
                  Precision Swiss Mathematical Studio
                </p>
              </div>
            </div>

            {/* Center: Mode Selector Pill Navigation */}
            <div className="flex items-center p-0.5 rounded-xl border border-white/10 dark:border-white/10 bg-black/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setCalcMode('scientific')}
                className={`px-2.5 py-1 rounded-lg text-xs font-calc-btn font-medium transition-all ${
                  calcMode === 'scientific' ? `${theme.accentBg} text-zinc-950 shadow-xs font-semibold` : `${theme.subtext} hover:${theme.text}`
                }`}
              >
                Scientific
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('standard')}
                className={`px-2.5 py-1 rounded-lg text-xs font-calc-btn font-medium transition-all ${
                  calcMode === 'standard' ? `${theme.accentBg} text-zinc-950 shadow-xs font-semibold` : `${theme.subtext} hover:${theme.text}`
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('programmer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-calc-btn font-medium transition-all ${
                  calcMode === 'programmer' ? `${theme.accentBg} text-zinc-950 shadow-xs font-semibold` : `${theme.subtext} hover:${theme.text}`
                }`}
              >
                Programmer
              </button>
            </div>

            {/* Right: Quick Tools */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(true)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl border ${theme.panelBorder} ${theme.badgeBg} text-xs font-calc-btn ${theme.subtext} hover:${theme.text} lg:hidden`}
                title="History"
              >
                <History className="w-3.5 h-3.5" />
                <span>({history.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className={`p-1.5 rounded-xl border ${theme.panelBorder} ${theme.badgeBg} ${theme.subtext} hover:${theme.text} transition-colors`}
                title={isMuted ? 'Unmute key sounds (M)' : 'Mute key sounds (M)'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setShowShortcuts(true)}
                className={`p-1.5 rounded-xl border ${theme.panelBorder} ${theme.badgeBg} ${theme.subtext} hover:${theme.text} transition-colors`}
                title="Keyboard shortcuts"
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={cycleTheme}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border ${theme.panelBorder} ${theme.badgeBg} text-xs font-calc-btn font-medium ${theme.accent} hover:scale-105 transition-all`}
                title="Switch aesthetic theme"
              >
                {themeKey === 'alabaster' || themeKey === 'bauhaus' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme.name}</span>
              </button>
            </div>
          </header>

          {/* Center Workspace: Main Calculator + Side Ledger */}
          <div className="w-full flex-1 flex flex-col justify-center my-auto">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              
              {/* Main Calculator Column */}
              <div className="lg:col-span-8 flex flex-col gap-2 justify-between">
                {/* Calculator Display */}
                <CalculatorDisplay
                  expression={expression}
                  prevLine={prevLine}
                  error={error}
                  livePreview={livePreview}
                  angleMode={angleMode}
                  memory={memory}
                  inv={inv}
                  theme={theme}
                />

                {/* Calculator Keypad */}
                <div className={`p-2.5 sm:p-3 rounded-2xl border ${theme.panelBorder} ${theme.panel} shadow-xs`}>
                  <Keypad
                    mode={calcMode}
                    inv={inv}
                    angleMode={angleMode}
                    isMuted={isMuted}
                    memory={memory}
                    theme={theme}
                    onAction={handleAction}
                    onToggleAngle={() => setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))}
                    onToggleInv={() => setInv((v) => !v)}
                  />
                </div>
              </div>

              {/* Desktop Embedded History Ledger Notebook */}
              <div className="hidden lg:block lg:col-span-4 h-full min-h-[380px] max-h-[440px]">
                <HistoryDrawer
                  isOpen={true}
                  isEmbedded={true}
                  history={history}
                  onSelectEntry={handleSelectHistory}
                  onDeleteEntry={(id) => setHistory((h) => h.filter((x) => x.id !== id))}
                  onClearHistory={() => setHistory([])}
                  theme={theme}
                />
              </div>
            </div>
          </div>

          {/* Clean Bottom Spacer for Dock Breathing Room */}
          <div className="h-2" />
        </section>

        {/* SECTION 2: Precision Unit Converter (Viewport Fitting) */}
        <UnitConverterSection
          theme={theme}
          onSendToCalculator={(val) => {
            setExpression(val);
            setPrevLine('');
            setJustEvaluated(true);
            scrollTo('#studio-hero');
          }}
        />

        {/* SECTION 3: Interactive Function Visualizer (Viewport Fitting) */}
        <PlotterSection
          theme={theme}
          onInsertFunction={(fn) => {
            insertText(fn);
            scrollTo('#studio-hero');
          }}
        />

      </GridBackground>

      {/* Floating Inspira Dock */}
      <div className="fixed bottom-3 inset-x-0 z-40 px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto">
          <InspiraDock items={dockItems} theme={theme} />
        </div>
      </div>

      {/* Mobile Slide-over History Drawer */}
      <HistoryDrawer
        isOpen={showHistoryDrawer}
        isEmbedded={false}
        onClose={() => setShowHistoryDrawer(false)}
        history={history}
        onSelectEntry={handleSelectHistory}
        onDeleteEntry={(id) => setHistory((h) => h.filter((x) => x.id !== id))}
        onClearHistory={() => setHistory([])}
        theme={theme}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        theme={theme}
      />
    </div>
  );
}

export default function CalcVerse() {
  return (
    <LenisProvider>
      <CalcVerseContent />
    </LenisProvider>
  );
}
