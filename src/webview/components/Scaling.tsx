import * as React from 'react';

export interface IScalingProps {
  width: number;
  scale: number;
}

export const Scaling: React.FunctionComponent<IScalingProps> = ({ width, scale}: React.PropsWithChildren<IScalingProps>) => {
  return (
    <div className='py-2 text-[var(--vscode-editorInfo-foreground)] bg-[var(--vscode-panel-border)] text-center rounded-b' style={{
      width: `${width * scale}px`,
    }}>
      <b>Info</b>: Image got scalled to fit the screen (scale: {(scale * 100).toFixed(0)}%).
    </div>
  );
};