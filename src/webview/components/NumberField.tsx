import * as React from 'react';
import { useMemo } from 'react';

export interface INumberFieldProps {
  label: string;
  placeholder: string;
  value: number;
  onChange: (value: number) => void;
  isFloat?: boolean;
  isDisabled?: boolean;
  isRange?: boolean;

  [prop: string]: any; // Allow any other property
}

export const NumberField: React.FunctionComponent<INumberFieldProps> = ({ label, placeholder, value, onChange, isFloat, 
  isRange, isDisabled, ...props }: React.PropsWithChildren<INumberFieldProps>) => {

  const styles = useMemo(() => {
    if (isRange) {
      return `mt-4 h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0 bg-[var(--vscode-checkbox-background)] border border-[var(--vscode-checkbox-border)]`;
    }

    return `mt-1 block p-2 rounded-md border-[var(--vscode-panel-border)] bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] shadow-sm sm:text-sm focus:outline-[var(--vscode-focusBorder)] focus:outline-1 disabled:opacity-75`
  }, [isRange])

  return (
    <div className='w-full'>
      <label htmlFor={label.replace(' ', '-').toLowerCase()} className="block text-sm font-medium text-[var(--vscode-editor-foreground)]">
        {label}
      </label>
      <div className="mt-1">
        <input
          type={isRange ? 'range' : 'number'}
          name={label.replace(' ', '-').toLowerCase()}
          value={value}
          className={`w-full ${styles}`}
          placeholder={placeholder}
          disabled={isDisabled}
          onChange={(e) => {
            const value = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
            if (value) {
              onChange(value);
            } else { 
              onChange(0);
            }
          }}
          {...props}
        />
      </div>
    </div>
  );
};