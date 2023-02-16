import * as React from 'react';
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import ReactMarkdown from 'react-markdown';
import "./styles.css";
import { EventData } from '@estruyf/vscode/dist/models';
var domtoimage = require("dom-to-image-more");

export interface IAppProps { }

export const App: React.FunctionComponent<IAppProps> = ({ }: React.PropsWithChildren<IAppProps>) => {
  const [code, setCode] = React.useState<string>('');

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
    const node = document.querySelector('.app__screenshot');
    if (!node) {
      return;
    }

    domtoimage.toBlob(node).then((blob: Blob) => {
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
    <div className='app'>
      <h1>Screendown</h1>

      <div className='app__actions'>
        Take a screenshot from your Markdown
      </div>

      {
        code && (
          <>
            <div className='app__screenshot'>
              <div className='app__screenshot__wrapper'>
                <div className='app__screenshot__wrapper__inner'>
                  <ReactMarkdown>
                    {code}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <button onClick={takeScreenshot}>
              Take screenshot
            </button>
          </>
        )
      }
    </div>
  );
};