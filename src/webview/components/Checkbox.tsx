import * as React from 'react';

export interface ICheckboxProps {
  label: string;
  description?: string;
  onChange: (value: boolean) => void;
}

export const Checkbox: React.FunctionComponent<ICheckboxProps> = ({ label, description, onChange }: React.PropsWithChildren<ICheckboxProps>) => {
  return (
    <div className="relative flex items-center">
      <div className="flex h-5 items-center">
        <input
          id={label.replace(/ /g, '-')}
          aria-describedby="comments-description"
          type="checkbox"
          className="h-4 w-4 rounded border-[var(--vscode-checkbox-border)] text-[var(--vscode-button-background)] focus:outline-none focus:ring-0"
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
      <div className="ml-2 text-sm flex flex-col justify-center">
        <label htmlFor={label.replace(/ /g, '-')} className="font-medium">
          {label}
        </label>
        {
          description && (
            <span className="text-xs">
              {description}
            </span>
          )
        }
      </div>
    </div>
  );
};