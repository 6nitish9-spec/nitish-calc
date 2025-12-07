import React from 'react';

export type CalculatorMode = 'standard' | 'scientific' | 'ai';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  type: 'manual' | 'ai';
  explanation?: string;
}

export interface ButtonProps {
  label: string | React.ReactNode;
  value?: string;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'action' | 'scientific' | 'ai';
  className?: string;
  cols?: number;
}

export interface AIResponse {
  result: string;
  steps: string;
  isError: boolean;
}