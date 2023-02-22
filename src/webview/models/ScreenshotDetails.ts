import { FontType } from "./FontType";
import { TitleBarType } from "./TitleBarType";

export interface ScreenshotDetails {
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

  titleBarType: TitleBarType;
  title?: string;
}