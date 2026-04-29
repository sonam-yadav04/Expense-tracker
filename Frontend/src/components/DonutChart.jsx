import React, { useState } from 'react';
import { formatCurrency } from '../utils/helpers';

const DonutChart = ({ data, total }) => {
  const [hovered, setHovered] = useState(null);
  const cx = 80, cy = 80, r = 60, gap = 3;

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
        No data to display
      </div>
    );
  }

  // Build segments
  let cumAngle = -Math.PI / 2;
  const segments = data.map(d => {
    const fraction = d.total / total;
    const angle    = fraction * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const midAngle = cumAngle - angle / 2;
    return {
      ...d,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      fraction,
      midAngle,
    };
  });

  const active = hovered !== null ? segments[hovered] : null;

  return (
    <div className="donut-wrapper">
      <div className="donut-container">
        <svg viewBox="0 0 160 160" width="160" height="160">
          <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="var(--bg-elevated)" strokeWidth="2" />
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.path}
              fill={seg.color}
              opacity={hovered === null || hovered === i ? 1 : 0.4}
              style={{
                cursor: 'pointer',
                transform: hovered === i
                  ? `translate(${Math.cos(seg.midAngle) * 4}px, ${Math.sin(seg.midAngle) * 4}px)`
                  : 'none',
                transition: 'all 0.2s ease',
                transformOrigin: `${cx}px ${cy}px`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <circle cx={cx} cy={cy} r={r * 0.52} fill="var(--bg-card)" />
        </svg>
        <div className="donut-center">
          <div className="donut-center-value">
            {active ? active.emoji : '💰'}
          </div>
          <div className="donut-center-label">
            {active ? `${(active.fraction * 100).toFixed(0)}%` : 'Total'}
          </div>
        </div>
      </div>

      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="legend-item"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.5 }}
          >
            <span className="legend-dot" style={{ background: seg.color }} />
            <span className="legend-name">{seg.label}</span>
            <span className="legend-value" style={{ color: seg.color, fontSize: 12 }}>
              {formatCurrency(seg.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;