import * as React from 'react';
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import ReactMarkdown from 'react-markdown';
import "./styles.css";
import { EventData } from '@estruyf/vscode/dist/models';
import { toBlob } from 'html-to-image';
import { Spinner } from './components/Spinner';
import { FormControl } from './components';
import { useRecoilValue } from 'recoil';
import { HeightState, ScreenshotDetailsState, WidthState } from './state';
import { Defaults } from './constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Styling } from './components/Styling';
import { Checkbox } from './components/Checkbox';

export interface IAppProps { }

export const App: React.FunctionComponent<IAppProps> = ({ }: React.PropsWithChildren<IAppProps>) => {
  const divRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLHeadingElement>(null);
  const [code, setCode] = useState<string>('');
  const [scale, setScale] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [copyToClipboard, setCopyToClipboard] = useState<boolean>(false);
  const { fontFamily, innerPadding, innerWidth, innerBorder } = useRecoilValue(ScreenshotDetailsState);
  const width = useRecoilValue(WidthState);
  const height = useRecoilValue(HeightState);

  /**
   * Message listener for the extension host
   * @param msg 
   * @returns 
   */
  const msgListener = (msg: MessageEvent<EventData<any>>) => {
    const { data } = msg;

    if (!data) {
      return;
    }

    if (data.command === "setMarkdown") {
      setCode(data.payload.trim());
    }
  };

  /**
   * Trigger the save image command
   * @param blob 
   */
  const saveImage = async (blob: Blob) => {
    messageHandler.send('saveImage', await blob.arrayBuffer());
  }

  /**
   * Unset the loading state
   */
  const unsetLoader = () => {
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  /**
   * Take a screenshot of the markdown
   * @returns 
   */
  const takeScreenshot = useCallback(async () => {
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
      parentNode.style.height = `${(height || Defaults.height) * scale}px`;

      if (!blob) {
        return;
      }

      if (copyToClipboard) {
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        navigator.clipboard.write([clipboardItem]);
        messageHandler.send('copied');
      } else {
        saveImage(blob);
      }

      unsetLoader();
    } catch(e) {
      unsetLoader();
    }
  }, [code, scale, height, width, copyToClipboard]);

  /**
   * Handle the resize of the window
   * @returns 
   */
  const triggerResize = (crntWidth: number, crntHeight: number) => {
    const node = divRef.current;
    const parentNode = parentRef.current;
    const screenshotNode = screenshotRef.current;
    const referenceNode = referenceRef.current;
    if (!node || !screenshotNode || !parentNode || !referenceNode) {
      return;
    }

    parentNode.style.height = ``;

    const sRect = referenceNode.parentElement?.getBoundingClientRect();
    if (!sRect) {
      return;
    }

    // Calculate the scale factor
    const scaleWidth = Math.min(referenceNode.clientWidth / crntWidth);

    let newScale = 1;
    if (scaleWidth < 1) {
      newScale = scaleWidth;
    } else {
      setScale(1);
      return;
    }

    // Set the scale factor
    node.style.transform = `scale(${newScale})`;
    node.style.transformOrigin = `top left`;
    parentNode.style.height = `${crntHeight * newScale}px`;
    setScale(newScale);
  };

  const handleResize = useCallback(() => {
    triggerResize(width || Defaults.width, height || Defaults.height);
  }, [width, height]);

  useEffect(() => {
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
      <Styling />

      { loading && <Spinner /> }

      <h1 ref={referenceRef} className={`text-3xl mb-4`}>Screendown</h1>

      <div className='text-lg mb-4'>
        Take a screenshot from your Markdown
      </div>

      {
        code ? (
          <>
            <FormControl handleResize={triggerResize} />
            
            <div ref={parentRef} className='relative h-auto' style={{
              height: `${(height || Defaults.height) * scale}px`,
            }}>
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
                    fontFamily: fontFamily === "ui" ? "var(--vscode-font-family)" : "var(--vscode-editor-font-family)",
                  }}>
                  <div 
                    className='screenshot__wrapper bg-transparent p-8 flex justify-center items-center' 
                    style={{
                      width: innerWidth ? `${innerWidth}%` : "100%",
                    }}>
                    <div
                      className='screenshot__wrapper__inner flex flex-col justify-center border-0 h-full space-y-4 p-4 bg-[var(--vscode-editor-background)] shadow-lg shadow-[var(--vscode-editor-background)] w-fit'
                      style={{
                        padding: innerPadding ? `${innerPadding}em` : "2em",
                        borderRadius: `${innerBorder}px`,
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
                <div className='py-2 text-[var(--vscode-editorInfo-foreground)] bg-[var(--vscode-panel-border)] text-center rounded-b' style={{
                  width: `${width * scale}px`,
                }}>
                  <b>Info</b>: Image got scalled to fit the screen (scale: {(scale * 100).toFixed(0)}%).
                </div>
              )
            }

            <div className='mt-4 flex items-center space-x-4'>
              <button
                className='rounded bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] px-4 py-2'
                onClick={takeScreenshot}>
                Take screenshot
              </button>

              <div>
                <Checkbox
                  label='Copy to clipboard'
                  description='Copy to the clipboard instead of storing it.'
                  onChange={(e) => setCopyToClipboard(e)} />
              </div>
            </div>
          </>
        ) : (
          <div className='mt-24 text-xl flex justify-center flex-col space-y-12'>
            <p>⬅</p>
            <p>⬅ Please select some Markdown content first</p>
            <p>⬅</p>
          </div>
        )
      }

      <img className='hidden' src='https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Festruyf%2Fscreendown%2Fusers&label=Usage&countColor=%230e131f' />
    </div>
  );
};