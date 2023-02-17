import * as React from 'react';
import { FontType } from '../App';

export interface ISelectFieldProps {
  label: string;
  placeholder: string;
  options: string[];
  value: FontType;
  onChange: (value: FontType) => void;
}

export const SelectField: React.FunctionComponent<ISelectFieldProps> = ({ options, label, placeholder, value, onChange }: React.PropsWithChildren<ISelectFieldProps>) => {
  return (
    <div className='w-full'>
      <label htmlFor={label.replace(' ', '-').toLowerCase()} className="block text-sm font-medium text-[var(--vscode-editor-foreground)]">
        {label}
      </label>
      <select
        name={label.replace(' ', '-').toLowerCase()}
        className="mt-1 block w-full p-2 rounded-md border-[var(--vscode-panel-border)] bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] shadow-sm sm:text-sm focus:outline-[var(--vscode-focusBorder)] focus:outline-1"
        defaultValue={value}
        placeholder={placeholder}
        onChange={(e) => {
          const value = e.target.value as FontType;
          onChange(value);
        }}
      >
        {options.map((option) => (
          <option key={option} selected={option === value}>{option}</option>
        ))}
      </select>
    </div>
  );
};