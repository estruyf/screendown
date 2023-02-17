import * as React from 'react';
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import ReactMarkdown from 'react-markdown';
import "./styles.css";
import { EventData } from '@estruyf/vscode/dist/models';
import { toBlob } from 'html-to-image';
import { NumberField } from './components/NumberField';
import { SelectField } from './components/SelectField';
import { StringField } from './components/StringField';

export interface IAppProps { }

export type FontType = "ui" | "editor";

export const App: React.FunctionComponent<IAppProps> = ({ }: React.PropsWithChildren<IAppProps>) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [code, setCode] = React.useState<string>('');
  const [width, setWidth] = React.useState<number>(1200);
  const [height, setHeigth] = React.useState<number>(675);
  const [scale, setScale] = React.useState<number>(1);
  const [font, setFont] = React.useState<FontType>("editor");
  const [link, setLink] = React.useState<string>("");

  const updateWidth = (value: number) => {
    if (value) {
      setWidth(value);
    }
    handleResize();
  }

  const updateHeight = (value: number) => {
    if (value) {
      setHeigth(value);
    }
    handleResize();
  }

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

  const takeScreenshot = async () => {
    const node = divRef.current;
    if (!node) {
      return;
    }

    const transform = node.style.transform;
    const transformOrigin = node.style.transformOrigin;

    node.style.transform = ``;
    node.style.transformOrigin = ``;

    const blob = await toBlob(node, {
      width,
      height,
    });

    node.style.transform = transform;
    node.style.transformOrigin = transformOrigin;

    if (!blob) {
      return;
    }
    saveImage(blob)
  };

  const handleResize = () => {
    const screenshot = divRef.current;
    if (!screenshot) {
      return;
    }
    
    screenshot.style.transform = ``;
    screenshot.style.transformOrigin = ``;

    const sRect = screenshot.getBoundingClientRect();
    
    // Calculate the scale factor
    const scale = Math.min(sRect.width / width);

    console.log(scale);

    if (scale > 1) {
      setScale(1);
      return;
    }

    // Set the scale factor
    screenshot.style.transform = `scale(${scale})`;
    screenshot.style.transformOrigin = `top left`;
    setScale(scale);
  };

  React.useEffect(() => {
    Messenger.listen(msgListener);

    messageHandler.request<string>('getMarkdown').then((msg) => {
      setCode(msg.trim());
      setTimeout(() => {
        handleResize();
      }, 0);
    });

    window.addEventListener("resize", handleResize, false);

    return () => {
      Messenger.unlisten(msgListener);
    }
  }, []);

  return (
    <div className='p-4'>
      <style>
      {` 
        a, a:hover, a:visited {
          color: ${link ? link : "var(--screendown-link)"} !important;
        }
      `}
      </style>
      <h1 className={`text-3xl mb-4`}>Screendown</h1>

      <div className='text-lg mb-4'>
        Take a screenshot from your Markdown
      </div>

      {
        code && (
          <div className='flex flex-col'>
            <div className='mb-4'>
              <div className='mb-2 space-y-4'>
                <div className='flex w-full space-x-4'>
                  <NumberField label={`Width`} placeholder={`width`} value={width} onChange={updateWidth} />
                  <NumberField label={`Height`} placeholder={`height`} value={height} onChange={updateHeight} />
                </div>

                <div>
                  <SelectField 
                    label={`Scale`} 
                    value={font} 
                    options={["ui", "editor"]}
                    placeholder={`Select font`}
                    onChange={(value: FontType) => {
                      console.log(value);
                      setFont(value)
                    }} />
                  </div>

                  <div>
                    <StringField
                      label={`Link`}
                      placeholder={`Link`}
                      value={link}
                      onChange={(value: string) => {
                        setLink(value);
                      }} />
                  </div>
              </div>
            </div>

            <div className='border border-[var(--vscode-panel-border)] rounded overflow-hidden'>
              <div 
                ref={divRef}
                className='screenshot'
                style={{
                  height: `${height*scale}px`,
                  width: `${width*scale}px`,
                  fontFamily: font === "ui" ? "var(--vscode-font-family)" : "var(--vscode-editor-font-family)",
                }}>
                <div className='screenshot__wrapper bg-transparent p-8 flex justify-center items-center' style={{
                    width: `${width}px`,
                    height: `${height}px`,
                  }}>
                  <div 
                    className='screenshot__wrapper__inner flex flex-col justify-center border-0 h-full space-y-4 p-4 bg-[var(--vscode-editor-background)] shadow shadow-[var(--vscode-editor-background)] w-fit'>
                    <ReactMarkdown>
                      {code}
                    </ReactMarkdown>
                  </div>
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
          </div>
        )
      }
    </div>
  );
};