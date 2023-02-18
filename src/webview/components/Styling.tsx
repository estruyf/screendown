import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { ScreenshotDetailsState } from '../state';

export interface IStylingProps {}

export const Styling: React.FunctionComponent<IStylingProps> = (props: React.PropsWithChildren<IStylingProps>) => {
  const { outerBackground, fontSize, linkColor } = useRecoilValue(ScreenshotDetailsState);
  
  return (
    <style>
      {` 
      .screenshot {
        font-size: ${fontSize}px;
      }

      a, a:hover, a:visited {
        color: ${linkColor ? linkColor : "var(--screendown-link)"} !important;
      }

      .screenshot {
        background: ${ outerBackground ? outerBackground : "var(--vscode-sideBar-background)" };
      }
    `}
    </style>
  );
};