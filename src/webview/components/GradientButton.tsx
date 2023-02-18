import * as React from 'react';

export interface IGradientButtonProps {
  value: string;
  onClick: () => void;
}

export const GradientButton: React.FunctionComponent<IGradientButtonProps> = ({value, onClick}: React.PropsWithChildren<IGradientButtonProps>) => {
  return (
    <button
      className='h-8 w-8 rounded border border-[var(--vscode-panel-border)] hover:brightness-125' 
      style={{
        background: value,
      }}
      onClick={onClick}>
    </button>
  );
};