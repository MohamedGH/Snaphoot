import React from 'react';

interface MiniSparklineProps {
  readonly data: readonly number[];
  readonly color: string;
  readonly height?: number;
  readonly minVal?: number;
  readonly maxVal?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color,
  height = 36,
  minVal,
  maxVal,
}) => {
  if (data.length < 2) {
    return <div style={{ height }} className="w-full flex items-center justify-center text-[10px] text-slate-500 font-mono">Gathering points...</div>;
  }

  const min = minVal !== undefined ? minVal : Math.min(...data);
  const max = maxVal !== undefined ? maxVal : Math.max(...data);
  const range = max - min || 1;

  const width = 140;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${color})`} />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
