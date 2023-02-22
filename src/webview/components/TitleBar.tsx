import * as React from 'react';
import { useMemo } from 'react';
import { TitleBarNames, TitleBarType } from '../models';

export interface ITitleBarProps {
  title?: string;
  innerBorder: number;
  innerPadding: number;
  fontSize?: number;
  barType: TitleBarType;
}

export const TitleBar: React.FunctionComponent<ITitleBarProps> = ({ barType, title, innerBorder, innerPadding, fontSize }: React.PropsWithChildren<ITitleBarProps>) => {

  const styles = useMemo(() => {
    if (barType === TitleBarNames.macOS || barType === TitleBarNames.Windows) {
      return `bg-[var(--vscode-titleBar-activeBackground)] text-[var(--vscode-titleBar-activeForeground)]`;
    } else {
      return `bg-[var(--vscode-titleBar-inactiveBackground)] text-[var(--vscode-titleBar-inactiveForeground)]`;
    }
  }, [barType])

  if (barType === TitleBarNames.None && !title) {
    return null;
  }

  return (
    <div className={`relative border-b border-[var(--vscode-titleBar-border)] p-4 ${title ? "flex" : "h-12 block"} ${styles} items-center`} style={{
      borderTopLeftRadius: `${innerBorder}px`,
      borderTopRightRadius: `${innerBorder}px`,
      marginLeft: `-${innerPadding}em`,
      marginRight: `-${innerPadding}em`,
      marginTop: `-${innerPadding}em`,
      marginBottom: `${innerPadding/2}em`,
    }}>
      {
        (barType === TitleBarNames.macOS || barType === TitleBarNames.macOSInactive) && (
          <div className='flex space-x-2 absolute'>
            <div className={`rounded-full h-4 w-4 ${barType === TitleBarNames.macOS ? "bg-[#FF5F57]" : "bg-[var(--vscode-titleBar-inactiveForeground)]"}`}></div>
            <div className={`rounded-full h-4 w-4 ${barType === TitleBarNames.macOS ? "bg-[#FEBC2E]" : "bg-[var(--vscode-titleBar-inactiveForeground)]"}`}></div>
            <div className={`rounded-full h-4 w-4 ${barType === TitleBarNames.macOS ? "bg-[#28C840]" : "bg-[var(--vscode-titleBar-inactiveForeground)]"}`}></div>
          </div>
        )
      }

      {
        title && (
          <div className='w-full text-lg text-center font-normal' style={{ fontSize: `${fontSize}px`}}>
            {title}
          </div>
        )
      }

      {
        (barType === TitleBarNames.Windows || barType === TitleBarNames.WindowsInactive) && (
          <div className='flex space-x-2 absolute right-4'>
            <div className='rounded-full h-6 w-6'>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M14 8v1H3V8h11z"></path></svg>
            </div>
            <div className='rounded-full h-6 w-6'>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"></path></svg>
            </div>
            <div className='rounded-full h-6 w-6'>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7.116 8l-4.558 4.558.884.884L8 8.884l4.558 4.558.884-.884L8.884 8l4.558-4.558-.884-.884L8 7.116 3.442 2.558l-.884.884L7.116 8z"></path></svg>
            </div>
          </div>
        )
      }
    </div>
  );
};