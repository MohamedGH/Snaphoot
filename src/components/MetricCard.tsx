import React from 'react';
import { LucideIcon } from 'lucide-react';
import { MiniSparkline } from './MiniSparkline';

interface MetricCardProps {
  readonly title: string;
  readonly value: string;
  readonly unit?: string;
  readonly subtitle: string;
  readonly icon: LucideIcon;
  readonly badgeText: string;
  readonly badgeColor: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';
  readonly sparklineData: readonly number[];
  readonly sparklineColor: string;
  readonly details: readonly { label: string; value: string }[];
  readonly delta?: { text: string; isPositive: boolean };
}

const BADGE_STYLES = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badgeText,
  badgeColor,
  sparklineData,
  sparklineColor,
  details,
  delta,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/50">
              <Icon className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px] sm:max-w-none">{subtitle}</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${BADGE_STYLES[badgeColor]}`}
          >
            {badgeText}
          </span>
        </div>

        {/* Main Metric Value */}
        <div className="flex items-baseline gap-1.5 my-2">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
            {value}
          </span>
          {unit && <span className="text-sm font-bold text-slate-400">{unit}</span>}
          {delta && (
            <span
              className={`text-xs font-mono font-medium ml-2 px-1.5 py-0.5 rounded ${
                delta.isPositive ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10'
              }`}
            >
              {delta.text}
            </span>
          )}
        </div>

        {/* Sparkline Visual */}
        <div className="my-2 pt-1">
          <MiniSparkline data={sparklineData} color={sparklineColor} height={36} />
        </div>
      </div>

      {/* Sub-Metric Attributes Grid */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
        {details.map((detail, idx) => (
          <div key={idx} className="bg-slate-950/40 rounded-lg px-2.5 py-1.5 border border-slate-800/50">
            <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {detail.label}
            </span>
            <span className="font-semibold text-slate-200 font-mono text-[11px] truncate block">
              {detail.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
