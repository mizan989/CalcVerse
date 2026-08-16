import { useState } from 'react';
import { ArrowRightLeft, Send, Copy, Check, Scale, Ruler, Thermometer, HardDrive, Gauge, Clock } from 'lucide-react';
import { BentoCard } from './ui/BentoCard';

const UNITS_DATA = {
  length: {
    name: 'Length',
    icon: Ruler,
    base: 'm',
    rates: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.344,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254,
    },
    labels: {
      m: 'Meters (m)',
      km: 'Kilometers (km)',
      cm: 'Centimeters (cm)',
      mm: 'Millimeters (mm)',
      mi: 'Miles (mi)',
      yd: 'Yards (yd)',
      ft: 'Feet (ft)',
      in: 'Inches (in)',
    },
  },
  mass: {
    name: 'Mass & Weight',
    icon: Scale,
    base: 'kg',
    rates: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.45359237,
      oz: 0.028349523125,
      t: 1000,
    },
    labels: {
      kg: 'Kilograms (kg)',
      g: 'Grams (g)',
      mg: 'Milligrams (mg)',
      lb: 'Pounds (lb)',
      oz: 'Ounces (oz)',
      t: 'Metric Tonnes (t)',
    },
  },
  temperature: {
    name: 'Temperature',
    icon: Thermometer,
    isSpecial: true,
    units: ['C', 'F', 'K'],
    labels: {
      C: 'Celsius (°C)',
      F: 'Fahrenheit (°F)',
      K: 'Kelvin (K)',
    },
  },
  data: {
    name: 'Digital Data',
    icon: HardDrive,
    base: 'B',
    rates: {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
      PB: 1024 ** 5,
    },
    labels: {
      B: 'Bytes (B)',
      KB: 'Kilobytes (KB)',
      MB: 'Megabytes (MB)',
      GB: 'Gigabytes (GB)',
      TB: 'Terabytes (TB)',
      PB: 'Petabytes (PB)',
    },
  },
  speed: {
    name: 'Speed',
    icon: Gauge,
    base: 'mps',
    rates: {
      mps: 1,
      kmh: 0.277778,
      mph: 0.44704,
      knot: 0.514444,
      mach: 340.29,
    },
    labels: {
      mps: 'Meters/sec (m/s)',
      kmh: 'Kilometers/hr (km/h)',
      mph: 'Miles/hr (mph)',
      knot: 'Knots (kn)',
      mach: 'Mach (at sea lvl)',
    },
  },
  time: {
    name: 'Time',
    icon: Clock,
    base: 's',
    rates: {
      ms: 0.001,
      s: 1,
      min: 60,
      hr: 3600,
      day: 86400,
      wk: 604800,
      yr: 31536000,
    },
    labels: {
      ms: 'Milliseconds (ms)',
      s: 'Seconds (s)',
      min: 'Minutes (min)',
      hr: 'Hours (hr)',
      day: 'Days (d)',
      wk: 'Weeks (wk)',
      yr: 'Years (yr)',
    },
  },
};

export function UnitConverterSection({ theme, onSendToCalculator }) {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [inputValue, setInputValue] = useState('10');
  const [copied, setCopied] = useState(false);

  const catData = UNITS_DATA[category];

  const handleCategoryChange = (catKey) => {
    setCategory(catKey);
    const data = UNITS_DATA[catKey];
    if (data.isSpecial) {
      setFromUnit('C');
      setToUnit('F');
    } else {
      const keys = Object.keys(data.rates);
      setFromUnit(keys[0]);
      setToUnit(keys[1] || keys[0]);
    }
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Convert calculation
  const calculateResult = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '—';

    if (category === 'temperature') {
      let celsius = val;
      if (fromUnit === 'F') celsius = ((val - 32) * 5) / 9;
      if (fromUnit === 'K') celsius = val - 273.15;

      let target = celsius;
      if (toUnit === 'F') target = (celsius * 9) / 5 + 32;
      if (toUnit === 'K') target = celsius + 273.15;

      return Number(target.toFixed(6)).toString();
    }

    const rates = catData.rates;
    if (!rates[fromUnit] || !rates[toUnit]) return '0';
    const baseValue = val * rates[fromUnit];
    const targetValue = baseValue / rates[toUnit];

    if (Math.abs(targetValue) < 1e-6 && targetValue !== 0) {
      return targetValue.toExponential(4);
    }
    return Number(targetValue.toFixed(8)).toString();
  };

  const convertedResult = calculateResult();

  const handleCopy = () => {
    if (convertedResult && convertedResult !== '—') {
      navigator.clipboard.writeText(convertedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const handleSend = () => {
    if (convertedResult && convertedResult !== '—' && onSendToCalculator) {
      onSendToCalculator(convertedResult);
    }
  };

  return (
    <section
      id="unit-converter"
      className="w-full h-[100dvh] max-h-[100dvh] min-h-[100dvh] flex flex-col justify-between max-w-5xl mx-auto px-4 pt-3 pb-2 sm:pt-4 sm:pb-3 overflow-hidden"
    >
      <div className="text-center sm:text-left">
        <h2 className={`text-base sm:text-xl font-bold tracking-tight ${theme.text}`}>
          Precision Unit Converter
        </h2>
        <p className={`text-[11px] sm:text-xs ${theme.subtext} font-mono mt-0.5`}>
          Instant bi-directional dimensional conversions across science & engineering units.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3.5 items-stretch">
          {/* Category Selector Tabs */}
          <div className="lg:col-span-4 flex lg:flex-col gap-1.5 overflow-x-auto pb-0.5 lg:pb-0">
            {Object.entries(UNITS_DATA).map(([key, item]) => {
              const Icon = item.icon;
              const isActive = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategoryChange(key)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left text-xs font-mono transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? `${theme.categoryActive} font-semibold shadow-xs`
                      : `${theme.panel} ${theme.panelBorder} ${theme.subtext} hover:${theme.text}`
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Converter Workspace Card */}
          <div className="lg:col-span-8">
            <BentoCard
              theme={theme}
              title={`${catData.name} Converter`}
              subtitle="Real-time synchronized dimension calculation"
              icon={catData.icon}
              action={
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border ${theme.panelBorder} ${theme.subtext} hover:${theme.text} transition-colors`}
                    title="Copy result"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  {onSendToCalculator && (
                    <button
                      type="button"
                      onClick={handleSend}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium ${theme.toolbarActive} transition-colors`}
                      title="Send result to main calculator"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>To Calc</span>
                    </button>
                  )}
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-9 gap-2.5 sm:gap-3 items-center">
                {/* From Unit */}
                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className={`text-[10px] font-mono ${theme.subtext}`}>From</label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl border ${theme.panelBorder} font-mono-math text-sm outline-none bg-black/5 dark:bg-white/5 ${theme.text} focus:border-emerald-500`}
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className={`w-full px-2.5 py-1 rounded-xl border ${theme.panelBorder} font-mono text-xs outline-none bg-black/5 dark:bg-white/5 ${theme.text}`}
                  >
                    {Object.entries(catData.labels).map(([uKey, uLabel]) => (
                      <option key={`from-${uKey}`} value={uKey} className="bg-zinc-900 text-zinc-100">
                        {uLabel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="sm:col-span-1 flex justify-center py-1 sm:py-0">
                  <button
                    type="button"
                    onClick={swapUnits}
                    className={`p-2 rounded-xl border ${theme.panelBorder} ${theme.subtext} hover:${theme.text} hover:scale-105 active:scale-95 transition-all`}
                    title="Swap units"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Unit */}
                <div className="sm:col-span-4 flex flex-col gap-1">
                  <label className={`text-[10px] font-mono ${theme.subtext}`}>To (Result)</label>
                  <div
                    className={`w-full px-3 py-1.5 rounded-xl border ${theme.panelBorder} font-mono-math text-sm font-semibold truncate bg-black/10 dark:bg-white/10 ${theme.text}`}
                  >
                    {convertedResult}
                  </div>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className={`w-full px-2.5 py-1 rounded-xl border ${theme.panelBorder} font-mono text-xs outline-none bg-black/5 dark:bg-white/5 ${theme.text}`}
                  >
                    {Object.entries(catData.labels).map(([uKey, uLabel]) => (
                      <option key={`to-${uKey}`} value={uKey} className="bg-zinc-900 text-zinc-100">
                        {uLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {/* Spacer to balance bottom */}
      <div className="h-6" />
    </section>
  );
}
