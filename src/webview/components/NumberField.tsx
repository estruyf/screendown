import * as React from 'react';

export interface INumberFieldProps {
  label: string;
  placeholder: string;
  value: number;
  onChange: (value: number) => void;

  [prop: string]: any; // Allow any other property
}

export const NumberField: React.FunctionComponent<INumberFieldProps> = ({ label, placeholder, value, onChange, ...props }: React.PropsWithChildren<INumberFieldProps>) => {
  return (
    <div className='w-full'>
      <label htmlFor={label.replace(' ', '-').toLowerCase()} className="block text-sm font-medium text-[var(--vscode-editor-foreground)]">
        {label}
      </label>
      <div className="mt-1">
        <input
          type="number"
          name={label.replace(' ', '-').toLowerCase()}
          value={value}
          className="mt-1 block w-full p-2 rounded-md border-[var(--vscode-panel-border)] bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] shadow-sm sm:text-sm focus:outline-[var(--vscode-focusBorder)] focus:outline-1"
          placeholder={placeholder}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
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