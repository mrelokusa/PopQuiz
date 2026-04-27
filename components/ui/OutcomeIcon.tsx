import React from 'react';
import { resolveOutcomeIcon } from '../../constants/outcomeIcons';

interface OutcomeIconProps {
  /** The string stored on the outcome (icon name or legacy emoji). */
  value: string | undefined;
  className?: string;
  strokeWidth?: number;
}

const OutcomeIcon: React.FC<OutcomeIconProps> = ({
  value,
  className = 'w-6 h-6',
  strokeWidth = 2.5,
}) => {
  const { Component } = resolveOutcomeIcon(value);
  return <Component className={className} strokeWidth={strokeWidth} />;
};

export default OutcomeIcon;
