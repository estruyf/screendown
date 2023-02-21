import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { domToBlob } from 'modern-screenshot';
import { useRecoilValue } from 'recoil';
import { HeightState, ScreenshotDetailsState, WidthState } from './state';
import { Defaults } from './constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CodeProps } from 'react-markdown/lib/ast-to-react';
import { ContentData } from '../models';
import { TitleBar, EmptyPlaceholder, Scaling, Image, Code, Styling, FormControl, Spinner } from './components';
import "./styles.css";

export interface IAppProps {
  webviewUrl: string;
  extUrl: string;
}

const codeBackup: { original: string, code: string }[] = [];
const imageBackup: { original: string, image: string }[] = [];

export const App: React.FunctionComponent<IAppProps> = ({ webviewUrl, extUrl }: React.PropsWithChildren<IAppProps>) => {
  const divRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLHeadingElement>(null);
  const [code, setCode] = useState<string>('');
  const [scale, setScale] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [themeId, setThemeId] = useState<string | undefined>(undefined);
  const { fontFamily, innerPadding, innerWidth, innerBorder, shadow, titleBarType, title, fontSize } = useRecoilValue(ScreenshotDetailsState);
  const width = useRecoilValue(WidthState);
  const height = useRecoilValue(HeightState);

  /**
   * Process the content from the extension host
   * @param data 
   */
  const processContent = (data: ContentData) => {
    if (data.content && data.language) {
      if (data.language !== "markdown") {
        setCode(`\`\`\`${data.language.toLowerCase()}
${data.content.trim()}
\`\`\``);
      } else {
        setCode(data.content.trim());
      }
    }
  }

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
      processContent(data.payload);
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
  const takeScreenshot = useCallback(async (copyToClipboard: boolean = false) => {
    setLoading(true);

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

    try {
      const blob = await domToBlob(screenshotNode, {
        width,
        height
      });

      node.style.transform = transform;
      node.style.transformOrigin = transformOrigin;
      parentNode.style.height = `${(height || Defaults.height) * scale}px`;

      unsetLoader();

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
    } catch (e) {
      node.style.transform = transform;
      node.style.transformOrigin = transformOrigin;
      parentNode.style.height = `${(height || Defaults.height) * scale}px`;
      unsetLoader();
      messageHandler.send('logError', `Failed to create the screenshot.`);
    }
  }, [code, scale, height, width]);

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

  const mutationObserver = new MutationObserver((mutationsList, observer) => {
    getTheme();
  });

  const getTheme = () => {
    const themeId = document.body.getAttribute("data-vscode-theme-id") || "";
    setThemeId(themeId);
  }

  const generateImage = (props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    const cachedImage = imageBackup.find(c => c.original === props.src);
    if (cachedImage && cachedImage.image) {
      return <img {...props} src={cachedImage.image} />;
    }

    if (props.src && props.src.startsWith("https://")) {
      return <Image {...props} triggerUpdate={(original: string, image: string) => {
        const findImage = imageBackup.find(c => c.original === original);
        if (!findImage) {
          imageBackup.push({ original, image });
        } else {
          findImage.image = image;
        }
      }} />;
    } else if (webviewUrl && props.src) {
      // Parse win path
      const src = props.src.split(`\\`).join(`/`);
      const srcJoined = `${webviewUrl}/${src.startsWith("/") ? src.substring(1) : src}`;
      return <img {...props} src={srcJoined} />;
    } else {
      return null;
    }
  };

  const generateCodeBlock = (props: CodeProps) => {
    const cachedCode = codeBackup.find(c => c.original === props.children.toString());
    if (cachedCode && cachedCode.code) {
      return <div dangerouslySetInnerHTML={{ __html: cachedCode.code }} />;
    }
    return <Code themeId={themeId} extUrl={extUrl} triggerUpdate={(original: string, code: string) => {
      const findCode = codeBackup.find(c => c.original === original);
      if (!findCode) {
        codeBackup.push({ original, code });
      } else {
        findCode.code = code;
      }
    }} {...props} />;
  };

  useEffect(() => {
    Messenger.listen(msgListener);

    messageHandler.request<ContentData>('getMarkdown').then((msg) => {
      processContent(msg);
      setTimeout(() => {
        handleResize();
      }, 0);
    });

    window.addEventListener("resize", handleResize, false);

    mutationObserver.observe(document.body, { childList: false, attributes: true });
    getTheme();

    return () => {
      Messenger.unlisten(msgListener);
    }
  }, []);

  return (
    <div className='p-4'>
      <Styling />

      {loading && <Spinner />}

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
                      className='screenshot__wrapper__inner w-full flex flex-col justify-center border-0 h-full space-y-4 p-4 bg-[var(--vscode-editor-background)]'
                      style={{
                        padding: innerPadding ? `${innerPadding}em` : "2em",
                        borderRadius: `${innerBorder}px`,
                        boxShadow: `0 0 ${shadow}px ${shadow / 5}px var(--vscode-editor-background)`,
                      }}>

                      <TitleBar
                        barType={titleBarType}
                        innerBorder={innerBorder}
                        innerPadding={innerPadding}
                        title={title}
                        fontSize={fontSize} />

                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components={{
                          img: (props) => {
                            return generateImage(props);
                          },
                          code: (props) => {
                            return generateCodeBlock(props);
                          },
                          pre: (props) => {
                            return generateCodeBlock(props);
                          }
                        }}
                      >
                        {code}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {
              scale < 1 && <Scaling width={width} scale={scale} />
            }

            <div className='mt-4 flex items-center space-x-4'>
              <button
                className='rounded bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] px-4 py-2'
                onClick={() => takeScreenshot(false)}>
                Save to file
              </button>

              <button
                className='rounded bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] px-4 py-2'
                onClick={() => takeScreenshot(true)}>
                Copy to clipboard
              </button>
            </div>
          </>
        ) : (
          <EmptyPlaceholder />
        )
      }

      <img className='hidden' src='https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Festruyf%2Fscreendown%2Fusers&label=Usage&countColor=%230e131f' />
    </div>
  );
};