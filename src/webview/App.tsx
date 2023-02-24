import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { domToBlob } from 'modern-screenshot';
import { useRecoilValue } from 'recoil';
import { HeightState, ScreenshotDetailsState, WidthState } from './state';
import { Defaults } from './constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CodeProps } from 'react-markdown/lib/ast-to-react';
import { ContentData } from '../models';
import {
  TitleBar,
  EmptyPlaceholder,
  Scaling,
  Image,
  Code,
  Styling,
  FormControl,
  Spinner,
  Watermark
} from './components';
import './styles.css';
import { PresetSelector } from './components/PresetSelector';
import { Button } from './components/Button';

export interface IAppProps {
  webviewUrl: string;
  extUrl: string;
}

const codeBackup: { original: string; code: string }[] = [];
const imageBackup: { original: string; image: string }[] = [];

export const App: React.FunctionComponent<IAppProps> = ({
  webviewUrl,
  extUrl
}: React.PropsWithChildren<IAppProps>) => {
  const divRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLHeadingElement>(null);
  const [code, setCode] = useState<string>('');
  const [scale, setScale] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [themeId, setThemeId] = useState<string | undefined>(undefined);
  const screenshotDetails = useRecoilValue(ScreenshotDetailsState);
  const width = useRecoilValue(WidthState);
  const height = useRecoilValue(HeightState);

  /**
   * Process the content from the extension host
   * @param data
   */
  const processContent = (data: ContentData) => {
    if (data.content && data.language) {
      if (data.language !== 'markdown') {
        setCode(`\`\`\`${data.language.toLowerCase()}
${data.content.trim()}
\`\`\``);
      } else {
        setCode(data.content.trim());
      }
    }
  };

  /**
   * Message listener for the extension host
   * @param msg
   * @returns
   */
  const msgListener = useCallback(
    (msg: MessageEvent<EventData<any>>) => {
      const { data } = msg;

      if (!data) {
        return;
      }

      if (data.command === 'setMarkdown') {
        processContent(data.payload);

        triggerResize(width || Defaults.width, height || Defaults.height);
      }
    },
    [width, height]
  );

  /**
   * Trigger the save image command
   * @param blob
   */
  const saveImage = async (blob: Blob) => {
    messageHandler.send('saveImage', await blob.arrayBuffer());
  };

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
  const takeScreenshot = useCallback(
    async (copyToClipboard: boolean = false) => {
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
    },
    [code, scale, height, width, divRef, parentRef, screenshotRef]
  );

  /**
   * Handle the resize of the window
   * @returns
   */
  const triggerResize = useCallback(
    (crntWidth: number, crntHeight: number, retry?: boolean, retryNr: number = 0) => {
      const node = divRef.current;
      const parentNode = parentRef.current;
      const screenshotNode = screenshotRef.current;
      const referenceNode = referenceRef.current;

      if (!node || !screenshotNode || !parentNode || !referenceNode) {
        if (retry && retryNr < 5) {
          setTimeout(() => {
            triggerResize(crntWidth, crntHeight, retry, ++retryNr);
          }, 0);
          return;
        } else {
          return;
        }
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
      }

      // Set the scale factor
      node.style.transform = newScale === 1 ? `` : `scale(${newScale})`;
      node.style.transformOrigin = newScale === 1 ? `` : `top left`;
      parentNode.style.height = `${crntHeight * newScale}px`;
      setScale(newScale);
    },
    [divRef, screenshotRef, parentRef, referenceRef]
  );

  const handleResize = useCallback(() => {
    triggerResize(width || Defaults.width, height || Defaults.height, true);
  }, [width, height]);

  const mutationObserver = new MutationObserver((mutationsList, observer) => {
    getTheme();
  });

  const getTheme = () => {
    const themeId = document.body.getAttribute('data-vscode-theme-id') || '';
    setThemeId(themeId);
  };

  const generateImage = (
    props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
  ) => {
    const cachedImage = imageBackup.find((c) => c.original === props.src);
    if (cachedImage && cachedImage.image) {
      return <img {...props} src={cachedImage.image} />;
    }

    return (
      <Image
        {...props}
        triggerUpdate={(original: string, image: string) => {
          const findImage = imageBackup.find((c) => c.original === original);
          if (!findImage) {
            imageBackup.push({ original, image });
          } else {
            findImage.image = image;
          }
        }}
      />
    );

    // if (props.src && props.src.startsWith("https://")) {
    //   return <Image {...props} triggerUpdate={(original: string, image: string) => {
    //     const findImage = imageBackup.find(c => c.original === original);
    //     if (!findImage) {
    //       imageBackup.push({ original, image });
    //     } else {
    //       findImage.image = image;
    //     }
    //   }} />;
    // } else if (webviewUrl && props.src) {
    //   // Parse win path
    //   const src = props.src.split(`\\`).join(`/`);
    //   const srcJoined = `${webviewUrl}/${src.startsWith("/") ? src.substring(1) : src}`;
    //   return <img {...props} src={srcJoined} />;
    // } else {
    //   return null;
    // }
  };

  const generateCodeBlock = useCallback(
    (props: CodeProps) => {
      const cachedCode = codeBackup.find((c) => c.original === props.children.toString());
      if (cachedCode && cachedCode.code) {
        return (
          <div
            className={screenshotDetails?.showLineNumbers ? 'show__linenumbers' : ''}
            dangerouslySetInnerHTML={{ __html: cachedCode.code }}
          />
        );
      }
      return (
        <Code
          themeId={themeId}
          extUrl={extUrl}
          showLineNumbers={screenshotDetails?.showLineNumbers}
          triggerUpdate={(original: string, code: string) => {
            const findCode = codeBackup.find((c) => c.original === original);
            if (!findCode) {
              codeBackup.push({ original, code });
            } else {
              findCode.code = code;
            }
          }}
          {...props}
        />
      );
    },
    [codeBackup, themeId, extUrl, screenshotDetails?.showLineNumbers]
  );

  useEffect(() => {
    window.removeEventListener('resize', handleResize, false);
    window.addEventListener('resize', handleResize, false);

    return () => {
      window.removeEventListener('resize', handleResize, false);
    };
  }, [handleResize, width, height]);

  useEffect(() => {
    Messenger.listen(msgListener);

    messageHandler.request<ContentData>('getMarkdown').then((msg) => {
      processContent(msg);
      handleResize();
    });

    mutationObserver.observe(document.body, { childList: false, attributes: true });
    getTheme();

    return () => {
      Messenger.unlisten(msgListener);
      window.removeEventListener('resize', handleResize, false);
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className="p-4">
      <Styling />

      {loading && <Spinner />}

      <h1 ref={referenceRef} className={`text-3xl mb-4`}>
        Screendown
      </h1>

      <div className="flex justify-between text-lg mb-4">
        <h2>Take a screenshot from your Markdown</h2>

        <PresetSelector />
      </div>

      {code && screenshotDetails ? (
        <>
          <FormControl handleResize={triggerResize} />

          <div
            ref={parentRef}
            className="relative h-auto"
            style={{
              height: `${(height || Defaults.height) * scale}px`
            }}
          >
            <div
              ref={divRef}
              className={`screenshot__outer border border-[var(--vscode-panel-border)] rounded-t overflow-hidden h-full w-full flex justify-center items-center ${scale < 1 ? '' : 'rounded-b'
                }`}
              style={{
                height: `${height}px`,
                width: `${width}px`
              }}
            >
              <div
                ref={screenshotRef}
                className="screenshot flex justify-center items-center"
                style={{
                  height: `${height}px`,
                  width: `${width}px`,
                  fontFamily:
                    screenshotDetails.fontFamily === 'ui'
                      ? 'var(--vscode-font-family)'
                      : 'var(--vscode-editor-font-family)'
                }}
              >
                <div
                  className="screenshot__wrapper bg-transparent p-8 flex flex-col justify-center items-center"
                  style={{
                    width: innerWidth ? `${innerWidth}%` : '100%'
                  }}
                >
                  <div
                    className="screenshot__wrapper__inner w-full flex flex-col justify-center border-0 h-full space-y-4 p-4 bg-[var(--vscode-editor-background)]"
                    style={{
                      padding: screenshotDetails.innerPadding
                        ? `${screenshotDetails.innerPadding}em`
                        : '2em',
                      borderRadius: `${screenshotDetails.innerBorder}px`,
                      boxShadow: `0 0 ${screenshotDetails.shadow}px ${screenshotDetails.shadow / 5
                        }px var(--vscode-editor-background)`
                    }}
                  >
                    <TitleBar
                      barType={screenshotDetails.titleBarType}
                      innerBorder={screenshotDetails.innerBorder}
                      innerPadding={screenshotDetails.innerPadding}
                      title={screenshotDetails.title}
                      fontSize={screenshotDetails.fontSize}
                    />

                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: (props) => {
                          return generateImage(props);
                        },
                        code: (props) => {
                          return generateCodeBlock(props);
                        }
                      }}
                    >
                      {code}
                    </ReactMarkdown>
                  </div>

                  {screenshotDetails.showWatermark && <Watermark scale={scale} />}
                </div>
              </div>
            </div>
          </div>

          {scale < 1 && <Scaling width={width} scale={scale} />}

          <div className="mt-4 flex items-center space-x-4">
            <Button title="Save to file" onClick={() => takeScreenshot(false)} />
            <Button title="Copy to clipboard" onClick={() => takeScreenshot(true)} />
          </div>
        </>
      ) : (
        <EmptyPlaceholder />
      )}

      <img
        className="hidden"
        src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Festruyf%2Fscreendown%2Fusers&label=Usage&countColor=%230e131f"
      />
    </div>
  );
};
