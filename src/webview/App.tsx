import * as React from 'react';
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import ReactMarkdown from 'react-markdown';
import "./styles.css";
import { EventData } from '@estruyf/vscode/dist/models';
var domtoimage = require("dom-to-image-more");

export interface IAppProps { }

export const App: React.FunctionComponent<IAppProps> = ({ }: React.PropsWithChildren<IAppProps>) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [code, setCode] = React.useState<string>('');
  const [width, setWidth] = React.useState<number>(1200);
  const [height, setHeigth] = React.useState<number>(675);

  const msgListener = (msg: MessageEvent<EventData<any>>) => {
    const { data } = msg;

    if (!data) {
      return;
    }

    if (data.command === "setMarkdown") {
      setCode(data.payload.trim());
    }
  };

  const saveImage = async (blob: Blob) => {
    messageHandler.send('saveImage', await blob.arrayBuffer());
  }

  const takeScreenshot = () => {
    const node = divRef.current;
    if (!node) {
      return;
    }

    domtoimage.toBlob(node, {
      height,
      width
    }).then((blob: Blob) => {
      saveImage(blob)
    })
    .catch((error: any) => {
      console.error('oops, something went wrong!', error);
    });
  };

  React.useEffect(() => {
    Messenger.listen(msgListener);

    messageHandler.request<string>('getMarkdown').then((msg) => {
      setCode(msg.trim());
    });

    return () => {
      Messenger.unlisten(msgListener);
    }
  }, []);

  return (
    <div className='p-4'>
      <h1 className={`text-3xl mb-4`}>Screendown</h1>

      <div className='text-lg mb-4'>
        Take a screenshot from your Markdown
      </div>

      {
        code && (
          <>
            <div className='mb-4'>
              <div className='mb-2'>
                <span className='font-bold'>Markdown</span>

                <input type="number" value={width} placeholder={`width`} className={`text-[var(--vscode-editor-background)]`} />
                <input type="number" value={height} placeholder={`height`} className={`text-[var(--vscode-editor-background)]`} />
              </div>
            </div>

            <div className='screenshot' ref={divRef}>
              <div className='screenshot__wrapper bg-white p-8' style={{
                  width: `${width}px`,
                  height: `${height}px`,
                }}>
                <div className='screenshot__wrapper__inner border-0 h-full space-y-4 p-4 bg-[var(--vscode-editor-background)] shadow shadow-[var(--vscode-editor-background)]'>
                  <ReactMarkdown>
                    {code}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <div className='flex justify-end'>
              <button
                className='mt-4 rounded bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] px-4 py-2' 
                onClick={takeScreenshot}>
                Take screenshot
              </button>
            </div>
          </>
        )
      }
    </div>
  );
};