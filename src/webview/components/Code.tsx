import { messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { CodeProps } from 'react-markdown/lib/ast-to-react';
import * as shiki from 'shiki';

export interface ICodeProps extends CodeProps {
  extUrl: string;
  themeId?: string;
  triggerUpdate: (original: string, code: string) => void;
}

export const Code: React.FunctionComponent<ICodeProps> = ({ children, themeId, extUrl, className, triggerUpdate }: React.PropsWithChildren<ICodeProps>) => {
  const [ code, setCode ] = useState('');
  const [ themeJson, setThemeJson ] = useState<any>(undefined);

  const getLanguage = (className: string) => {
    const language = className.split('-')[1];

    switch (language) {
      case 'ts':
        return 'typescript';
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
      const language = className.split('-')[1];
      shiki.setCDN(`${extUrl}/assets/shiki/`);

      shiki.getHighlighter({
        langs: [language as any],
        theme: themeJson as any
      }).then((highlighter: shiki.Highlighter) => {
        let code = children.toString();

        if (code.endsWith(`\n`)) {
          code = code.slice(0, -1);
        }

        setCode(
          highlighter.codeToHtml(code, {
            lang: getLanguage(className)
          })
        );
      }).then(() => {
        if (location.hash) {
          location.href = location.href;
        }
      });
    }
  }, [className, children, extUrl, themeJson]);
  
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
  
  if (!className && children) {
    return <code>{children}</code>;
  }

  if (!code) {
    return null;
  }

  return (
    <div dangerouslySetInnerHTML={{__html: code}} />
  );
};