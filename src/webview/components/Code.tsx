import { messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { CodeProps } from 'react-markdown/lib/ast-to-react';
import * as shiki from 'shiki';

export interface ICodeProps extends CodeProps {
  extUrl: string;
  themeId?: string;
  showLineNumbers?: boolean;
  triggerUpdate: (original: string, code: string) => void;
}

export const Code: React.FunctionComponent<ICodeProps> = ({ children, inline, showLineNumbers, themeId, extUrl, className, triggerUpdate }: React.PropsWithChildren<ICodeProps>) => {
  const [code, setCode] = useState('');
  const [themeJson, setThemeJson] = useState<any>(undefined);

  const getLanguage = (language: string) => {
    switch (language) {
      case 'ts':
      case 'typescriptreact':
        return 'typescript';
      case 'javascriptreact':
      case 'js':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return language;
    }
  }

  const initCode = useCallback(async () => {
    if (className && children && themeJson) {
      let language = getLanguage(className.split('-')[1]);

      shiki.setCDN(`${extUrl}/assets/shiki/`);

      shiki.getHighlighter({
        langs: [language as any],
        theme: themeJson as any
      }).then((highlighter: shiki.Highlighter) => {
        let code = children.toString();

        if (code.endsWith(`\n`)) {
          code = code.slice(0, -1);
        }

        const htmlCode = highlighter.codeToHtml(code, {
          lang: getLanguage(language)
        });

        // Replace all lines
        const lines = htmlCode.split(`\n`);
        const newLines = lines.map((line, index) => {
          line = line.replace(/<span class="line">/, `<span class="line"><span class="line__number">${index + 1}</span>`);
          return line;
        });

        setCode(newLines.join(`\n`));
      }).then(() => {
        if (location.hash) {
          location.href = location.href;
        }
      });
    }
  }, [className, children, extUrl, themeJson, showLineNumbers]);

  useEffect(() => {
    if (code) {
      triggerUpdate(children.toString(), code);
    }
  }, [code]);

  useEffect(() => {
    initCode();
  }, [className, extUrl, themeJson]);

  useEffect(() => {
    messageHandler.request<string>('getTheme', themeId).then((theme: string) => {
      if (theme) {
        setThemeJson(theme);
      }
    });
  }, [themeId]);

  if (inline) {
    return (
      <code className={className}>
        {children}
      </code>
    );
  }

  if (!className && children) {
    return (
      <code className={`unkown__language ${showLineNumbers ? 'show__linenumbers' : ''}`}>
        {children.toString().split(`\n`).map((line, index) => (
          line && (
            <div key={index} className="line">
              {showLineNumbers && (<span className='line__number'>{index + 1}</span>)} {line}
            </div>
          )
        ))}
      </code>
    );
  }

  if (!code) {
    return null;
  }

  return (
    <div className={`shiki ${showLineNumbers ? 'show__linenumbers' : ''}`} dangerouslySetInnerHTML={{ __html: code }} />
  );
};