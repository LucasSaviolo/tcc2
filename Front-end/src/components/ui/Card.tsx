import React from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const hoverClass = hover ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : '';

  const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`pb-3 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle: React.FC<CardTitleProps> = ({
  children,
  as = 'h3',
  className = '',
  ...props
}) => {
  const Component = as;
  return (
    <Component className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </Component>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`pt-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
export { Card, CardHeader, CardTitle, CardContent };

