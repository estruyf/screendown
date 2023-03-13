import { FontType } from './FontType';
import { TitleBarType } from './TitleBarType';

export interface ScreenshotDetails {
  name: string;
  preset?: string;

  fontSize: number;
  fontFamily: FontType | string;
  linkColor?: string;

  outerBackground?: string;

  innerWidth: number;
  innerPadding: number;
  innerBorder: number;
  shadow: number;
  showLineNumbers: boolean;
  showWatermark: boolean;
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;

  titleBarType: TitleBarType;
  title?: string;

  width?: number;
  height?: number;
}
