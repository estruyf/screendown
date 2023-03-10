import * as React from 'react';

export interface IStringFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export const StringField: React.FunctionComponent<IStringFieldProps> = ({ label, placeholder, value, onChange }: React.PropsWithChildren<IStringFieldProps>) => {
  return (
    <div className='w-full'>
      <label htmlFor={label.replace(' ', '-').toLowerCase()} className="block text-sm font-medium text-[var(--vscode-editor-foreground)]">
        {label}
      </label>
      <div className="mt-1">
        <input
          type="text"
          name={label.replace(' ', '-').toLowerCase()}
          value={value}
          className="mt-1 block w-full p-2 rounded-md border-[var(--vscode-panel-border)] bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] shadow-sm sm:text-sm focus:outline-[var(--vscode-focusBorder)] focus:outline-1"
          placeholder={placeholder}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              onChange(value);
            } else { 
              onChange('');
            }
          }}
        />
      </div>
    </div>
  );
};