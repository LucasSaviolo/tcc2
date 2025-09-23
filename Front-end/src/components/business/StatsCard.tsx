import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import Card from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color?: string;
  bgColor?: string;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  color = 'text-blue-600',
  bgColor = 'bg-blue-50',
  description,
}) => {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-md ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              </div>
            </dd>
          </dl>
        </div>
      </div>
      
      {change !== undefined && (
        <div className="mt-4">
          <div className="flex items-center text-sm">
            {changeType === 'increase' && (
              <TrendingUp className="flex-shrink-0 w-4 h-4 text-green-500" />
            )}
            {changeType === 'decrease' && (
              <TrendingUp className="flex-shrink-0 w-4 h-4 text-red-500 rotate-180" />
            )}
            <span className={`ml-1 font-medium ${
              changeType === 'increase' ? 'text-green-700' :
              changeType === 'decrease' ? 'text-red-700' : 'text-gray-500'
            }`}>
              {change > 0 ? '+' : ''}{change}
            </span>
            <span className="ml-1 text-gray-500">vs mês anterior</span>
          </div>
        </div>
      )}
      
      {description && (
        <div className="mt-2">
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;

