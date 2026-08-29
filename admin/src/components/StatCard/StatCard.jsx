import React from 'react';
import './StatCard.css';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = "primary", change, isIncrease = true, subtitle }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={22} />
          </div>
        )}
      </div>

      <div className="stat-body">
        <h3 className="stat-value">{value}</h3>
        {change && (
          <div className={`stat-trend ${isIncrease ? 'up' : 'down'}`}>
            {isIncrease ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{change}</span>
            <span className="trend-period">vs last month</span>
          </div>
        )}
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
