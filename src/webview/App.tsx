import * as React from 'react';
import { messageHandler } from '@estruyf/vscode/dist/client';
import ReactMarkdown from 'react-markdown';
import "./styles.css";

export interface IAppProps { }

export const App: React.FunctionComponent<IAppProps> = ({ }: React.PropsWithChildren<IAppProps>) => {
  const [code, setCode] = React.useState<string>('');

  const onPasteHandler = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const msg = event.clipboardData.getData('text/html');
    setCode(msg);
  }

  React.useEffect(() => {
    messageHandler.request<string>('getMarkdown').then((msg) => {
      setCode(msg);
    });
  }, []);

  return (
    <div className='app'>
      <h1>Screendown</h1>

      <div className='app__actions'>
        Welcome to screendown
      </div>

      <div className='bg-white'>
        <textarea onPaste={onPasteHandler} className='w-full h-64 p-4' />
      </div>

      {
        code && (
          <ReactMarkdown>
            {code}
          </ReactMarkdown>
        )
      }
    </div>
  );
};