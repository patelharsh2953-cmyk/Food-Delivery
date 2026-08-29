import React, { useState } from 'react';
import './Charts.css';
import { TrendingUp, TrendingDown, IndianRupee, Sparkles } from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

/**
 * Line Charts 9 Component (from 21st.dev MCP)
 * Customized to match the FoodDel Dashboard theme with 100% dynamic data
 */
export const SalesOverviewChart = ({ 
  data, 
  totalRevenue, 
  todaysSales, 
  highValue, 
  lowValue, 
  growth = 14.8 
}) => {
  const defaultData = [
    { date: 'Aug 23', value: 380, orders: 1 },
    { date: 'Aug 24', value: 650, orders: 2 },
    { date: 'Aug 25', value: 920, orders: 3 },
    { date: 'Aug 26', value: 1480, orders: 4 },
    { date: 'Aug 27', value: 1850, orders: 5 },
    { date: 'Aug 28', value: 2420, orders: 7 },
    { date: 'Aug 29', value: 3662, orders: 10 },
  ];

  const chartData = (data && data.length > 0) ? data : defaultData;
  const currentTotal = totalRevenue !== undefined ? totalRevenue : chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const currentToday = todaysSales !== undefined ? todaysSales : (chartData[chartData.length - 1]?.value || 0);
  
  const values = chartData.map(d => Number(d.value) || 0);
  const highest = highValue !== undefined && highValue > 0 ? highValue : Math.max(...values, 0);
  const lowest = lowValue !== undefined && lowValue > 0 ? lowValue : Math.min(...values, 0);

  // Active peak date for reference line highlight
  const peakItem = chartData.reduce((prev, curr) => ((curr.value || 0) > (prev.value || 0) ? curr : prev), chartData[0]);

  return (
    <div className="chart-card line-chart-9-card">
      {/* Top Header Row with Metrics (Line Charts 9 style) */}
      <div className="lc9-header">
        <div className="lc9-header-main">
          <span className="lc9-label">
            Live Store Revenue Trend <Sparkles size={14} color="#ff4c24" />
          </span>
          <div className="lc9-metric-row">
            <h2 className="lc9-value">₹{currentTotal.toLocaleString()}</h2>
            <div className="lc9-trend-pill up">
              <TrendingUp size={15} />
              <span>+{growth}%</span>
              <span className="lc9-trend-sub">Last 7 days</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="lc9-stats-bar">
          <div className="lc9-stat-item today">
            <span className="lc9-stat-title">Today's Sales:</span>
            <span className="lc9-stat-val">₹{currentToday.toLocaleString()}</span>
            <span className="lc9-stat-pct">(+{growth}%)</span>
          </div>

          <div className="lc9-stat-metrics">
            <div className="metric-chip chip-high">
              <span>High:</span> <b>₹{highest.toLocaleString()}</b>
            </div>
            <div className="metric-chip chip-low">
              <span>Low:</span> <b>₹{lowest.toLocaleString()}</b>
            </div>
            <div className="metric-chip chip-growth">
              <span>Growth:</span> <b>+{growth}%</b>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="lc9-chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={chartData}
            margin={{ top: 18, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              {/* Soft area gradient fill */}
              <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4c24" stopOpacity={0.22} />
                <stop offset="65%" stopColor="#ff4c24" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#ff4c24" stopOpacity={0.0} />
              </linearGradient>

              {/* Dot Grid Pattern */}
              <pattern id="lc9DotGrid" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="9" cy="9" r="1" fill="#e2e8f0" fillOpacity="0.75" />
              </pattern>

              {/* Dot Glow Drop Shadow */}
              <filter id="lc9DotShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(255, 76, 36, 0.45)" />
              </filter>
            </defs>

            {/* Background Dot Matrix Pattern */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#lc9DotGrid)" style={{ pointerEvents: 'none' }} />

            {/* Dotted Cartesian Grid */}
            <CartesianGrid
              strokeDasharray="4 8"
              stroke="#f1f5f9"
              horizontal={true}
              vertical={false}
            />

            {/* Peak Reference Highlight Line */}
            {peakItem && (
              <ReferenceLine 
                x={peakItem.date} 
                stroke="#ff4c24" 
                strokeDasharray="3 3" 
                strokeOpacity={0.65} 
              />
            )}

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
              tickMargin={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              tickMargin={10}
            />

            {/* Custom Sleek Tooltip */}
            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{ stroke: '#ff4c24', strokeDasharray: '3 3', strokeWidth: 1.2, strokeOpacity: 0.5 }}
            />

            {/* Gradient Area under line */}
            <Area
              type="monotone"
              dataKey="value"
              fill="url(#salesAreaGradient)"
              stroke="none"
            />

            {/* Glowing Accent Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#ff4c24"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isPeak = payload.date === peakItem?.date;
                const isLast = payload.date === chartData[chartData.length - 1]?.date;
                if (isPeak || isLast) {
                  return (
                    <circle
                      key={`dot-${payload.date}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#ffffff"
                      stroke="#ff4c24"
                      strokeWidth={3}
                      filter="url(#lc9DotShadow)"
                    />
                  );
                }
                return <circle key={`dot-${payload.date}`} cx={cx} cy={cy} r={2} fill="#ff4c24" opacity={0.6} />;
              }}
              activeDot={{
                r: 7,
                fill: '#ffffff',
                stroke: '#ff4c24',
                strokeWidth: 3,
                filter: 'url(#lc9DotShadow)'
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Custom Tooltip component
const CustomChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="lc9-tooltip-card fade-in">
        <div className="lc9-tooltip-date">{data.date}</div>
        <div className="lc9-tooltip-body">
          <div className="lc9-tooltip-val">₹{Number(data.value).toLocaleString()}</div>
          <span className="lc9-tooltip-badge">
            {data.orders ? `${data.orders} Orders` : 'Completed'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Order Status Breakdown Donut Chart
 */
export const OrderStatusChart = ({ breakdown }) => {
  const data = breakdown || {
    Delivered: 450,
    Preparing: 120,
    "Out for Delivery": 85,
    Cancelled: 35
  };

  const total = Object.values(data).reduce((acc, curr) => acc + curr, 0) || 1;

  const items = [
    { label: 'Delivered', value: data.Delivered || 0, color: '#10b981' },
    { label: 'Preparing', value: data.Preparing || 0, color: '#f59e0b' },
    { label: 'Out for Delivery', value: data['Out for Delivery'] || 0, color: '#3b82f6' },
    { label: 'Cancelled', value: data.Cancelled || 0, color: '#ef4444' },
  ];

  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Order Status Ratio</h3>
          <p className="chart-subtitle">Current fulfillment distribution</p>
        </div>
      </div>

      <div className="donut-chart-wrapper">
        <div className="donut-center">
          <svg viewBox="-1 -1 2 2" className="donut-svg">
            {items.map((item, index) => {
              const percent = item.value / total;
              if (percent <= 0) return null;
              
              const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
              cumulativePercent += percent;
              const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

              const largeArcFlag = percent > 0.5 ? 1 : 0;
              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
              ].join(' ');

              return <path key={index} d={pathData} fill={item.color} />;
            })}
            <circle cx="0" cy="0" r="0.65" fill="#ffffff" />
          </svg>
          <div className="donut-total">
            <span className="total-num">{total}</span>
            <span className="total-lbl">Total Orders</span>
          </div>
        </div>

        <div className="donut-legend">
          {items.map((item, index) => (
            <div key={index} className="legend-row">
              <div className="legend-info">
                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                <span className="legend-label">{item.label}</span>
              </div>
              <span className="legend-val">{item.value} ({Math.round((item.value / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
