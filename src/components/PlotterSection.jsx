import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as math from 'mathjs';
import { Activity, ZoomIn, ZoomOut, Send } from 'lucide-react';
import { BentoCard } from './ui/BentoCard';

const PRESET_FUNCTIONS = [
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'cos(x)', expr: 'cos(x)' },
  { label: 'x²', expr: 'x^2' },
  { label: 'x³ - 3x', expr: 'x^3 - 3*x' },
  { label: '1/x', expr: '1/x' },
  { label: 'e^(-x²)', expr: 'exp(-x^2)' },
  { label: 'tan(x)', expr: 'tan(x)' },
  { label: 'abs(x)', expr: 'abs(x)' },
];

export function PlotterSection({ theme, onInsertFunction }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [exprInput, setExprInput] = useState('sin(x)');
  const [zoom, setZoom] = useState(10); // Domain from -zoom to +zoom

  const isLight = theme.id === 'alabaster' || theme.id === 'bauhaus';

  const { compiled, plotError } = useMemo(() => {
    try {
      const c = math.compile(exprInput);
      return { compiled: c, plotError: null };
    } catch {
      return { compiled: null, plotError: 'Invalid function syntax' };
    }
  }, [exprInput]);

  const drawPlot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 220;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Coordinate mapping
    const originX = width / 2;
    const originY = height / 2;
    const scaleX = width / (2 * zoom);
    const scaleY = height / (2 * zoom);

    // Draw Grid Lines
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    const step = zoom <= 5 ? 1 : zoom <= 15 ? 2 : 5;
    for (let x = -zoom; x <= zoom; x += step) {
      const px = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }
    for (let y = -zoom; y <= zoom; y += step) {
      const py = originY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

    // Draw Main Axes
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Axis coordinate labels
    ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.fillText(`-${zoom}`, 4, originY - 4);
    ctx.fillText(`+${zoom}`, width - 26, originY - 4);
    ctx.fillText(`+${zoom}`, originX + 4, 12);
    ctx.fillText(`-${zoom}`, originX + 4, height - 4);

    if (compiled) {
      // Plot curve
      ctx.strokeStyle = theme.plotColor || '#10b981';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      let isDrawing = false;
      const numSteps = Math.min(width * 2, 800);

      for (let i = 0; i <= numSteps; i++) {
        const px = (i / numSteps) * width;
        const x = (px - originX) / scaleX;

        try {
          const y = compiled.evaluate({ x });
          if (typeof y !== 'number' || isNaN(y) || !isFinite(y) || Math.abs(y) > zoom * 5) {
            isDrawing = false;
            continue;
          }

          const py = originY - y * scaleY;

          if (!isDrawing) {
            ctx.moveTo(px, py);
            isDrawing = true;
          } else {
            ctx.lineTo(px, py);
          }
        } catch {
          isDrawing = false;
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [compiled, zoom, theme.plotColor, isLight]);

  // Handle ResizeObserver and initial render
  useEffect(() => {
    drawPlot();

    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      drawPlot();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [drawPlot]);

  return (
    <section
      id="function-plotter"
      className="w-full h-[100dvh] max-h-[100dvh] min-h-[100dvh] flex flex-col justify-between max-w-5xl mx-auto px-4 pt-3 pb-2 sm:pt-4 sm:pb-3 overflow-hidden"
    >
      <div className="text-center sm:text-left">
        <h2 className={`text-base sm:text-xl font-bold tracking-tight ${theme.text}`}>
          Interactive Function Visualizer
        </h2>
        <p className={`text-[11px] sm:text-xs ${theme.subtext} font-mono mt-0.5`}>
          Plot continuous 2D mathematical curves and harmonic trigonometric functions in real-time.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center my-auto">
        <BentoCard
          theme={theme}
          title="Cartesian Function Studio"
          subtitle={`Domain: [-${zoom}, +${zoom}], Range: [-${zoom}, +${zoom}]`}
          icon={Activity}
          action={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(2, z - 2))}
                className={`p-1.5 rounded-lg border ${theme.panelBorder} ${theme.subtext} hover:${theme.text} transition-colors`}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(30, z + 2))}
                className={`p-1.5 rounded-lg border ${theme.panelBorder} ${theme.subtext} hover:${theme.text} transition-colors`}
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          }
        >
          <div className="space-y-2.5">
            {/* Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className={`text-[10px] font-mono ${theme.subtext} mr-1 shrink-0`}>Presets:</span>
              {PRESET_FUNCTIONS.map((p) => (
                <button
                  key={p.expr}
                  type="button"
                  onClick={() => setExprInput(p.expr)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono border transition-all shrink-0 ${
                    exprInput === p.expr
                      ? `${theme.activeBadge} font-semibold`
                      : `${theme.panelBorder} ${theme.subtext} hover:${theme.text}`
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Expression Input Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-1.5">
              <div className="relative w-full flex items-center">
                <span className={`absolute left-3 font-mono text-xs sm:text-sm ${theme.accent} font-semibold`}>
                  f(x) =
                </span>
                <input
                  type="text"
                  value={exprInput}
                  onChange={(e) => setExprInput(e.target.value)}
                  placeholder="e.g. sin(x) + cos(2*x)"
                  className={`w-full pl-12 pr-3 py-1.5 rounded-xl border ${theme.panelBorder} font-mono-math text-xs sm:text-sm outline-none bg-black/5 dark:bg-white/5 ${theme.text} focus:border-emerald-500`}
                />
              </div>
              {onInsertFunction && (
                <button
                  type="button"
                  onClick={() => onInsertFunction(exprInput)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-medium ${theme.toolbarActive} whitespace-nowrap transition-colors`}
                  title="Send expression to calculator"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>To Calc</span>
                </button>
              )}
              {plotError && (
                <span className="text-[11px] font-mono text-rose-400 whitespace-nowrap">{plotError}</span>
              )}
            </div>

            {/* Plot Canvas */}
            <div
              ref={containerRef}
              className={`relative w-full h-36 sm:h-48 lg:h-52 rounded-xl border ${theme.panelBorder} bg-black/5 dark:bg-black/30 overflow-hidden flex items-center justify-center`}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute bottom-1.5 right-2 font-mono text-[9px] opacity-40 pointer-events-none">
                Zoom: ±{zoom}
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Minimal Bottom Colophon Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono opacity-50 px-1 pt-1 pb-1">
        <span>CalcVerse Studio • 100% Offline Precision Engine</span>
        <span>Minimal Swiss & Inspira UI</span>
      </div>
    </section>
  );
}
