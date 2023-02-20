import * as React from 'react';

export interface ITitleBarProps {
  title?: string;
  innerBorder: number;
  innerPadding: number;
  fontSize?: number;
}

export const TitleBar: React.FunctionComponent<ITitleBarProps> = ({ title, innerBorder, innerPadding, fontSize }: React.PropsWithChildren<ITitleBarProps>) => {
  return (
    <div className={`relative border-b border-[var(--vscode-titleBar-border)] p-4 ${title ? "flex" : "h-8 block"} items-center bg-[var(--vscode-titleBar-activeBackground)] text-[var(--vscode-titleBar-activeForeground)]`} style={{
      borderTopLeftRadius: `${innerBorder}px`,
      borderTopRightRadius: `${innerBorder}px`,
      marginLeft: `-${innerPadding}em`,
      marginRight: `-${innerPadding}em`,
      marginTop: `-${innerPadding}em`,
      marginBottom: `${innerPadding}em`,
    }}>
      <div className='flex space-x-2 absolute'>
        <div className='rounded-full h-4 w-4 bg-[#FF5F57]'></div>
        <div className='rounded-full h-4 w-4 bg-[#FEBC2E]'></div>
        <div className='rounded-full h-4 w-4 bg-[#28C840]'></div>
      </div>

      {
        title && (
          <div className='w-full text-lg text-center font-normal' style={{ fontSize: `${fontSize}px`}}>
            {title}
          </div>
        )
      }
    </div>
  );
};