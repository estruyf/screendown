import * as React from 'react';

export interface IEmptyPlaceholderProps {}

export const EmptyPlaceholder: React.FunctionComponent<IEmptyPlaceholderProps> = (props: React.PropsWithChildren<IEmptyPlaceholderProps>) => {
  return (
    <div className='mt-24 text-xl flex justify-center flex-col space-y-12'>
      <p>⬅</p>
      <p>⬅ Please select some Markdown content first</p>
      <p>⬅</p>
    </div>
  );
};