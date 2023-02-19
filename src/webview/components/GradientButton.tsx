import * as React from 'react';

export interface IGradientButtonProps {
  value: string;
  onClick: () => void;
}

export const GradientButton: React.FunctionComponent<IGradientButtonProps> = ({value, onClick}: React.PropsWithChildren<IGradientButtonProps>) => {
  return (
    <button
      className={`${value === "transparent" ? "transparent" : "hover:brightness-125"} gradient__button h-8 w-8 rounded border border-[var(--vscode-panel-border)]`}
      style={{
        background: value === "transparent" ? undefined : value,
      }}
      onClick={onClick}>
    </button>
  );
};