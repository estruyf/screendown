import * as React from 'react';

export interface IButtonProps {
  title: string;
  onClick: () => void;
  variant?: 'default' | 'small';
  disabled?: boolean;
}

export const Button: React.FunctionComponent<IButtonProps> = ({ title, onClick, variant, disabled }: React.PropsWithChildren<IButtonProps>) => {
  return (
    <button
      className={`rounded bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] ${variant && variant === 'small' ? 'text-xs p-1' : 'px-4 py-2'} disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled}>
      {title}
    </button>
  );
};