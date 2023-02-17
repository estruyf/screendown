import * as React from 'react';
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import ReactMarkdown from 'react-markdown';
import "./styles.css";
import { EventData } from '@estruyf/vscode/dist/models';
import { toBlob } from 'html-to-image';
import { NumberField } from './components/NumberField';
import { SelectField } from './components/SelectField';
import { StringField } from './components/StringField';
import { Spinner } from './components/Spinner';

export interface IAppProps { }

export type FontType = "ui" | "editor";

export const App: React.FunctionComponent<IAppProps> = ({ }: React.PropsWithChildren<IAppProps>) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const parentRef = React.useRef<HTMLDivElement>(null);
  const screenshotRef = React.useRef<HTMLDivElement>(null);
  const [code, setCode] = React.useState<string>('');
  const [width, setWidth] = React.useState<number>(1200);
  const [height, setHeigth] = React.useState<number>(675);
  const [innerWidth, setInnerWidth] = React.useState<number>(100);
  const [innerPadding, setInnerPadding] = React.useState<number>(2);
  const [scale, setScale] = React.useState<number>(1);
  const [fontsize, setFontsize] = React.useState<number>(13);
  const [font, setFont] = React.useState<FontType>("editor");
  const [link, setLink] = React.useState<string>("");
  const [outerBackground, setOuterBackground] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

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

  const updateFontsize = (value: number) => {
    if (value) {
      setFontsize(value);
    } else {
      setFontsize(13);
    }
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
    setLoading(true);
    
    try {
      const node = divRef.current;
      const parentNode = parentRef.current;
      const screenshotNode = screenshotRef.current;
      if (!node || !screenshotNode || !parentNode) {
        return;
      }

      const transform = node.style.transform;
      const transformOrigin = node.style.transformOrigin;

      node.style.transform = ``;
      node.style.transformOrigin = ``;
      parentNode.style.height = ``;

      const blob = await toBlob(screenshotNode, {
        width,
        height,
      });

      node.style.transform = transform;
      node.style.transformOrigin = transformOrigin;
      parentNode.style.height = `${height * scale}px`;

      if (!blob) {
        return;
      }

      saveImage(blob)
      setLoading(false);
    } catch(e) {
      setLoading(false);
    }
  };

  const handleResize = () => {
    const node = divRef.current;
    const parentNode = parentRef.current;
    const screenshotNode = screenshotRef.current;
    if (!node || !screenshotNode || !parentNode) {
      return;
    }

    parentNode.style.height = ``;

    const sRect = node.parentElement?.getBoundingClientRect();
    if (!sRect) {
      return;
    }

    // Calculate the scale factor
    const scaleWidth = Math.min(sRect.width / (width * scale));
    const scaleHeight = Math.min(sRect.height / (height * scale));

    let newScale = 1;
    if (scaleWidth > 1 && scaleHeight > 1) {
      setScale(1);
      return;
    } else if (scaleWidth < scaleHeight) {
      newScale = scaleWidth;
    } else {
      newScale = scaleHeight;
    }

    // Set the scale factor
    node.style.transform = `scale(${newScale})`;
    node.style.transformOrigin = `top left`;
    parentNode.style.height = `${height * newScale}px`;
    setScale(newScale);
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
        .screenshot {
          font-size: ${fontsize}px;
        }

        a, a:hover, a:visited {
          color: ${link ? link : "var(--screendown-link)"} !important;
        }

        .screenshot {
          background: ${ outerBackground ? outerBackground : "var(--vscode-sideBar-background)" };
        }
      `}
      </style>

      { loading && <Spinner /> }

      <h1 className={`text-3xl mb-4`}>Screendown</h1>

      <div className='text-lg mb-4'>
        Take a screenshot from your Markdown
      </div>

      {
        code ? (
          <>
            <div className='mb-4'>
              <div className='mb-2 space-y-4'>
                <div className='flex w-full space-x-4'>
                  <NumberField label={`Width`} placeholder={`width`} value={width} onChange={updateWidth} />
                  <NumberField label={`Height`} placeholder={`height`} value={height} onChange={updateHeight} />
                </div>

                <div className='flex w-full space-x-4'>
                  <StringField
                    label={`Link`}
                    placeholder={`Link color (ex: #000000)`}
                    value={link}
                    onChange={(value: string) => {
                      setLink(value);
                    }} />

                  <SelectField
                    label={`Font`}
                    value={font}
                    options={["ui", "editor"]}
                    placeholder={`Select font`}
                    onChange={(value: FontType) => {
                      setFont(value)
                    }} />

                  <NumberField label={`Font size`} placeholder={`Enter the font-size`} value={fontsize} onChange={updateFontsize} />
                </div>

                <div className='flex w-full space-x-4'>
                  <StringField
                    label={`Outer background`}
                    placeholder={`Background color (ex: #000000)`}
                    value={outerBackground}
                    onChange={(value: string) => {
                      setOuterBackground(value);
                    }} />
                  <NumberField label={`Inner width`} placeholder={`Inner width (50-100)`} value={innerWidth} onChange={setInnerWidth} step={5} min={50} max={100} />
                  <NumberField label={`Inner padding`} placeholder={`Inner padding (1-25)`} value={innerPadding} onChange={setInnerPadding} min={1} max={25} step={0.25} isFloat />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--vscode-editor-foreground)]">
                    Predefined backgrounds
                  </label>
                  <div className='mt-1 space-x-2'>
                    <button
                      className='h-8 w-8 rounded border border-[var(--vscode-panel-border)] hover:brightness-125' 
                      style={{
                        background: `radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)`,
                      }}
                      onClick={() => setOuterBackground(`radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)`)}>
                    </button>
                    <button
                      className='h-8 w-8 rounded border border-[var(--vscode-panel-border)] hover:brightness-125' 
                      style={{
                        background: `radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)`,
                      }}
                      onClick={() => setOuterBackground(`radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)`)}>
                    </button>
                    <button
                      className='h-8 w-8 rounded border border-[var(--vscode-panel-border)] hover:brightness-125' 
                      style={{
                        background: `linear-gradient(to right top, #051937, #004d7a, #008793, #00bf72, #a8eb12)`,
                      }}
                      onClick={() => setOuterBackground(`linear-gradient(to right top, #051937, #004d7a, #008793, #00bf72, #a8eb12)`)}>
                    </button>
                    <button
                      className='h-8 w-8 rounded border border-[var(--vscode-panel-border)] hover:brightness-125' 
                      style={{
                        background: `linear-gradient(to right bottom, #f141a8, #ff6180, #ff9460, #ffc855, #f9f871)`,
                      }}
                      onClick={() => setOuterBackground(`linear-gradient(to right bottom, #f141a8, #ff6180, #ff9460, #ffc855, #f9f871)`)}>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div ref={parentRef} className='relative h-auto'>
              <div ref={divRef} className={`screenshot__outer mx-auto border border-[var(--vscode-panel-border)] rounded-t overflow-hidden h-full w-full flex justify-center items-center ${scale < 1 ? "" : "rounded-b"}`} style={{
                height: `${height}px`,
                width: `${width}px`,
              }}>
                <div
                  ref={screenshotRef}
                  className='screenshot flex justify-center items-center'
                  style={{
                    height: `${height}px`,
                    width: `${width}px`,
                    fontFamily: font === "ui" ? "var(--vscode-font-family)" : "var(--vscode-editor-font-family)",
                  }}>
                  <div 
                    className='screenshot__wrapper bg-transparent p-8 flex justify-center items-center' 
                    style={{
                      width: innerWidth ? `${innerWidth}%` : "100%",
                    }}>
                    <div
                      className='screenshot__wrapper__inner flex flex-col justify-center border-0 h-full space-y-4 p-4 bg-[var(--vscode-editor-background)] shadow-lg shadow-[var(--vscode-editor-background)] rounded-lg w-fit'
                      style={{
                        padding: innerPadding ? `${innerPadding}em` : "2em",
                      }}>
                      <ReactMarkdown>
                        {code}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {
              scale < 1 && (
                <div className='py-2 text-[var(--vscode-editorInfo-foreground)] bg-[var(--vscode-panel-border)] text-center rounded-b'>
                  <b>Info</b>: Image got scalled to fit the screen (scale: {(scale * 100).toFixed(0)}%).
                </div>
              )
            }

            <div className='flex justify-start'>
              <button
                className='mt-4 rounded bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] px-4 py-2'
                onClick={takeScreenshot}>
                Take screenshot
              </button>
            </div>
          </>
        ) : (
          <div className='mt-24 text-2xl flex justify-center flex-col space-y-12'>
            <p>⬅</p>
            <p>⬅ Please select some Markdown content to take a screenshot</p>
            <p>⬅</p>
          </div>
        )
      }
    </div>
  );
};